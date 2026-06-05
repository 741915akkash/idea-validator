import { getQuery, readBody, eventHandler, createError } from 'h3'
import { pool } from '../../../db'
import { requireWorkspaceAccess } from '../../../utils/quizAccess'
import {
  getEventEntitlementsFromDb,
  getUsageSnapshot,
  observeCountLimit
} from '../../../utils/track-usage'

export default eventHandler(async (event) => {
  // force=true means:
  // "always create a new quiz"
  // instead of reusing an existing in-progress one.
  const { force } = getQuery(event)
  const body = (await readBody(event)) || {}
  const forceNew = force === 'true'

  // --------------------------------------------------
  // Architecture:
  //
  // Logged-in User
  //      ↓
  // Workspace (Idea)
  //      ↓
  // Quiz (Root or Revision)
  //
  // Every quiz MUST belong to a workspace.
  // --------------------------------------------------

  const userId = event.context?.user?.id || event.context?.auth?.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  const workspaceId = body.workspace_id || body.workspaceId

  if (!workspaceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'workspace_id required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Verify user owns the workspace.
    await requireWorkspaceAccess(client, event, workspaceId, {
      select: 'id'
    })

    // --------------------------------------------------
    // Find existing active quiz in this workspace.
    //
    // Normally:
    //   reuse active quiz
    //
    // force=true:
    //   create a fresh quiz
    // --------------------------------------------------

    const existingQuizRes = await client.query(
      `
      SELECT id
      FROM quizzes
      WHERE workspace_id = $1
        AND archived_at IS NULL
        AND status IN ('NOT_STARTED', 'IN_PROGRESS')
      ORDER BY started_at DESC NULLS LAST
      LIMIT 1
      `,
      [workspaceId]
    )

    let quizId
    let isNewQuiz = false

    const shouldReuseExisting = !forceNew

    if (shouldReuseExisting && existingQuizRes.rowCount > 0) {
      quizId = existingQuizRes.rows[0].id
    } else {
      // --------------------------------------------------
      // Plan limits:
      // Active ideas are counted at creation time.
      // --------------------------------------------------

      const { tier, limits } = await getEventEntitlementsFromDb({
        event,
        client
      })

      const usage = await getUsageSnapshot(client, event)

      const activeIdeasLimitCheck = observeCountLimit(event, {
        mode: 'observe',
        checkpoint: 'quiz.lifecycle.start',
        key: 'activeIdeas',
        tier,
        used: usage.activeIdeas,
        limit: limits.activeIdeas,
        increment: 1
      })

      if (activeIdeasLimitCheck.wouldBlock) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Active ideas limit reached for your current plan'
        })
      }

      // --------------------------------------------------
      // Create quiz inside workspace.
      //
      // IMPORTANT:
      // Never create quizzes without workspace_id.
      // --------------------------------------------------

      const quizRes = await client.query(
        `
        INSERT INTO quizzes (
          user_id,
          workspace_id,
          status,
          started_at
        )
        VALUES (
          $1,
          $2,
          'IN_PROGRESS',
          now()
        )
        RETURNING id
        `,
        [userId, workspaceId]
      )

      quizId = quizRes.rows[0].id
      isNewQuiz = true

      // --------------------------------------------------
      // Initialize quiz lifecycle tables.
      // --------------------------------------------------

      await client.query(
        `
        INSERT INTO quiz_state (quiz_id)
        VALUES ($1)
        `,
        [quizId]
      )

      await client.query(
        `
        INSERT INTO quiz_checkpoints (
          quiz_id,
          checkpoint
        )
        SELECT
          $1,
          checkpoint
        FROM (
          SELECT DISTINCT checkpoint
          FROM questions
        ) q
        `,
        [quizId]
      )
    }

    // --------------------------------------------------
    // Keep user's current quiz pointer in sync.
    // --------------------------------------------------

    await client.query(
      `
      UPDATE users
      SET current_quiz_id = $1
      WHERE id = $2
      `,
      [quizId, userId]
    )

    await client.query('COMMIT')

    return {
      quiz_id: quizId,
      is_new: isNewQuiz
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
