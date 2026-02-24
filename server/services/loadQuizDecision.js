import { pool } from '../db'

/**
 * Load final decision for a scored quiz.
 */
export async function loadQuizDecision(quizId) {
  const { rows } = await pool.query(
    `
    SELECT decision
    FROM quiz_results
    WHERE quiz_id = $1
    `,
    [quizId]
  )

  if (rows.length === 0) {
    throw new Error(`No quiz result found for quiz_id=${quizId}`)
  }

  return rows[0].decision
}
