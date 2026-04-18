import { eventHandler, readBody, createError } from 'h3'
import { pool } from '../../db'
import { requireQuizAccess } from '../../utils/quizAccess'

export default eventHandler(async (event) => {
  const { quiz_id, name } = await readBody(event)

  if (!quiz_id || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id and name required'
    })
  }

  const client = await pool.connect()

  try {
    await requireQuizAccess(client, event, quiz_id)

    await client.query(
      `
      UPDATE quizzes
      SET name = $1
      WHERE id = $2
      `,
      [name.trim(), quiz_id]
    )

    return { success: true }
  } finally {
    client.release()
  }
})
