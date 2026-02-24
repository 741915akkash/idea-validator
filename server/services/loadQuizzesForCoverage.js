import { pool } from '../db'

export async function loadQuizzesForCoverage() {
  const { rows } = await pool.query(`
    SELECT
      q.id AS quiz_id,
      qcs.signals,
      qr.decision
    FROM quizzes q
    JOIN quiz_checkpoint_signals qcs ON qcs.quiz_id = q.id
    JOIN quiz_results qr ON qr.quiz_id = q.id
    WHERE q.status = 'COMPLETED'
  `)

  return rows.map((r) => ({
    quiz_id: r.quiz_id,
    signals: r.signals,
    decision: r.decision
  }))
}
