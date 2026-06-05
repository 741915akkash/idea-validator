import { eventHandler, readBody, createError } from 'h3'
import { pool } from '../../db'
import { requireQuizAccess, requireUserIdentity, requireWorkspaceAccess } from '../../utils/quizAccess'
import {
  getEventEntitlementsFromDb,
  getUsageSnapshot,
  observeCountLimit
} from '../../utils/track-usage'

export default eventHandler(async (event) => {
  const { quiz_id } = await readBody(event)
  const { userId } = requireUserIdentity(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const selectedQuiz = await requireQuizAccess(client, event, quiz_id, {
      includeArchived: true,
      select: 'id, workspace_id'
    })
    await requireWorkspaceAccess(client, event, selectedQuiz.workspace_id, {
      select: 'id'
    })
    const { tier, limits } = await getEventEntitlementsFromDb({ event, client })
    const usage = await getUsageSnapshot(client, event, { quizId: quiz_id })

    const activeIdeasLimitCheck = observeCountLimit(event, {
      mode: 'observe',
      checkpoint: 'quiz.unarchive',
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

    const updateResult = await client.query(
      `
      UPDATE quizzes
      SET archived_at = NULL
      WHERE id = $1
        AND user_id = $2
        AND workspace_id = $3
      RETURNING id
      `,
      [quiz_id, userId, selectedQuiz.workspace_id]
    )

    if (!updateResult.rowCount) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Quiz not found'
      })
    }

    await client.query(
      `
      UPDATE users
      SET current_quiz_id = $1
      WHERE id = $2
      `,
      [quiz_id, userId]
    )

    await client.query('COMMIT')

    return {
      success: true,
      quiz_id
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
