import { pool } from '../../db'
import { calculateScores } from '../../services/scoring'

export default defineEventHandler(async (event) => {
  const { quiz_id } = await readBody(event)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1️⃣ Validate quiz state
    const quizRes = await client.query(`SELECT status FROM quizzes WHERE id = $1`, [quiz_id])

    if (!quizRes.rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'Quiz not found' })
    }

    if (quizRes.rows[0].status !== 'READY_TO_SCORE') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Quiz not ready for scoring'
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

    // 3️⃣ Calculate scores
    const result = await calculateScores(client, quiz_id)

    // 4️⃣ BUILD SNAPSHOT (🔥 THIS IS THE FIX)
    const summary = {
      market_decision: result.decision,
      market_breakdown: result.summary.market_breakdown,
      confidence_breakdown: result.summary.confidence_breakdown,
      locked: result.locked,
      lock_reason: result.lock_reason || null
    }

    // 5️⃣ Persist immutable snapshot
    await client.query(
      `
      INSERT INTO quiz_results
        (quiz_id, market_score, confidence_score, decision, summary)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [quiz_id, result.marketScore, result.confidenceScore, result.decision, summary]
    )

    // 6️⃣ Finalize quiz
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
      locked: result.locked,
      summary
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
})
