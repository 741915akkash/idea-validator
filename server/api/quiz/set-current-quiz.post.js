import { pool } from '../../db'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  const { user_id, quiz_id } = body || {}

  if (!user_id || !quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'user_id and quiz_id are required'
    })
  }

  const client = await pool.connect()

  try {
    const ownership = await client.query(
      `
      SELECT 1
      FROM quizzes
      WHERE id = $1 AND user_id = $2
      `,
      [quiz_id, user_id]
    )

    if (ownership.rowCount === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Quiz not found for user'
      })
    }

    await client.query(
      `
      UPDATE users
      SET current_quiz_id = $1
      WHERE id = $2
      `,
      [quiz_id, user_id]
    )

    return { success: true }
  } finally {
    client.release()
  }
})
