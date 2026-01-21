import { eventHandler } from 'h3'
import { pool } from '../../db'

export default eventHandler(async (event) => {
  const client = await pool.connect()

  try {
    const res = await client.query(`
      SELECT
        id,
        name,
        status,
        parent_quiz_id,
        revision_number
      FROM quizzes
      ORDER BY
        COALESCE(parent_quiz_id, id),
        revision_number
    `)

    return res.rows
  } finally {
    client.release()
  }
})
