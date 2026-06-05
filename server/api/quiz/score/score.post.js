import { pool } from '../../../db'
import { calculateScores } from '../../../services/scoring'
import { deriveCheckpointSignals } from '../../../services/deriveCheckpointSignals'
import { createError } from 'h3'
import { requireQuizAccess, requireWorkspaceAccess } from '../../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const { quiz_id } = await readBody(event)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1️⃣ Fetch quiz
    const quiz = await requireQuizAccess(client, event, quiz_id, {
      select: 'id, status, parent_quiz_id, revision_number, workspace_id'
    })
    await requireWorkspaceAccess(client, event, quiz.workspace_id, {
      select: 'id'
    })

    if (quiz.status !== 'IN_PROGRESS') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Quiz cannot be scored in its current state'
      })
    }

    // 2️⃣ Prevent double scoring
    const existing = await client.query(`SELECT 1 FROM quiz_results WHERE quiz_id = $1`, [quiz_id])

    if (existing.rows.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Quiz already scored'
      })
    }

    // 3️⃣ Ensure all questions answered (authoritative)
    const unanswered = await client.query(
      `
      SELECT 1
      FROM questions q
      LEFT JOIN answers a
        ON a.question_id = q.id
       AND a.quiz_id = $1
      WHERE a.question_id IS NULL
      LIMIT 1
      `,
      [quiz_id]
    )

    if (unanswered.rows.length) {
      throw createError({
        statusCode: 400,
        statusMessage: `Answer all questions before scoring

                            First from assumptions
                            Then update from research`
      })
    }

    // 4️⃣ 🔒 Revision diff check (main option only)
    if (quiz.revision_number > 0) {
      let prevQuizId

      if (quiz.revision_number === 1) {
        prevQuizId = quiz.parent_quiz_id
      } else {
        const prevRes = await client.query(
          `
          SELECT id
          FROM quizzes
          WHERE parent_quiz_id = $1
            AND revision_number = $2
          `,
          [quiz.parent_quiz_id, quiz.revision_number - 1]
        )

        prevQuizId = prevRes.rows[0]?.id
      }

      if (!prevQuizId) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Previous revision missing'
        })
      }

      const diffRes = await client.query(
        `
        (
          SELECT question_id, selected_option
          FROM answers
          WHERE quiz_id = $1
        )
        EXCEPT
        (
          SELECT question_id, selected_option
          FROM answers
          WHERE quiz_id = $2
        )
        LIMIT 1
        `,
        [quiz_id, prevQuizId]
      )

      if (!diffRes.rows.length) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Score is identical to previous revision. Change at least one option to get a new score.'
        })
      }
    }

    // 5️⃣ Calculate scores (LOCKED LOGIC)
    const result = await calculateScores(client, quiz_id)

    // 6️⃣ Derive checkpoint signals (NEW — semantic labels only)
    const checkpointSignals = await deriveCheckpointSignals(client, quiz_id)

    // 7️⃣ Persist immutable quiz result snapshot
    const summary = {
      market_decision: result.decision,
      market_breakdown: result.summary.market_breakdown,
      confidence_breakdown: result.summary.confidence_breakdown,
      locked: true
    }

    await client.query(
      `
      INSERT INTO quiz_results
        (quiz_id, market_score, confidence_score, decision, summary)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [quiz_id, result.marketScore, result.confidenceScore, result.decision, summary]
    )

    // 8️⃣ Persist checkpoint signals (NEW TABLE)
    await client.query(
      `
      INSERT INTO quiz_checkpoint_signals (quiz_id, signals)
      VALUES ($1, $2)
      `,
      [quiz_id, checkpointSignals]
    )

    // 9️⃣ Lock quiz
    await client.query(
      `
      UPDATE quizzes
      SET status = 'COMPLETED',
          completed_at = now()
      WHERE id = $1
      `,
      [quiz_id]
    )

    await client.query('COMMIT')

    return {
      market_score: result.marketScore,
      confidence_score: result.confidenceScore,
      decision: result.decision,
      summary
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
})
