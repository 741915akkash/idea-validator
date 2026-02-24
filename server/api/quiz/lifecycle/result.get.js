import { pool } from '../../../db'

export default defineEventHandler(async (event) => {
  const quizId = getQuery(event).quiz_id

  const { rows } = await pool.query(`SELECT * FROM quiz_results WHERE quiz_id = $1`, [quizId])

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
})
