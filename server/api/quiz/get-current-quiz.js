import { pool } from '../../db'

export async function getCurrentQuizId(userId) {
  const client = await pool.connect()

  try {
    const { rows } = await client.query(
      `
      SELECT current_quiz_id
      FROM users
      WHERE id = $1
      `,
      [userId]
    )

    return rows[0]?.current_quiz_id || null
  } finally {
    client.release()
  }
}
