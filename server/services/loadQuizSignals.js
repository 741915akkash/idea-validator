import { pool } from '../db'

/**
 * Load checkpoint signals for a completed quiz.
 * Signals are immutable snapshots created at scoring time.
 */
export async function loadQuizSignals(quizId) {
  const { rows } = await pool.query(
    `
    SELECT signals
    FROM quiz_checkpoint_signals
    WHERE quiz_id = $1
    `,
    [quizId]
  )

  if (rows.length === 0) {
    throw new Error(`No checkpoint signals found for quiz_id=${quizId}`)
  }

  return rows[0].signals
}
