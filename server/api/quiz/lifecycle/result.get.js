import { pool } from '../../../db'
import { createError, getQuery } from 'h3'
import { requireQuizAccess } from '../../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const quizId = getQuery(event).quiz_id

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id is required' })
  }

  const client = await pool.connect()
  try {
    await requireQuizAccess(client, event, quizId)

    const { rows } = await client.query(`SELECT * FROM quiz_results WHERE quiz_id = $1`, [quizId])
    if (!rows[0]) return null

    const r = rows[0]

    // 🔥 NORMALIZE SUMMARY SHAPE
    if (r.summary?.breakdown) {
      r.summary = {
        market_decision: r.decision,
        market_breakdown: r.summary.breakdown.marketByCheckpoint,
        confidence_breakdown: r.summary.breakdown.confidenceByCheckpoint
      }
    }

    return r
  } finally {
    client.release()
  }
})
