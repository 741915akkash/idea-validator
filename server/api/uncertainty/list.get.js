import { pool } from '../../db'
import { requireQuizAccess } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const { quiz_id } = getQuery(event)

  if (!quiz_id) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  const client = await pool.connect()
  try {
    await requireQuizAccess(client, event, quiz_id)

    const { rows } = await client.query(
      `
      SELECT id, text, created_at
      FROM uncertainties
      WHERE quiz_id = $1
      ORDER BY created_at DESC
      `,
      [quiz_id]
    )

    return rows
  } finally {
    client.release()
  }
})
