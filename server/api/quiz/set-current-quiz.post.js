import { pool } from '../../db'
import { requireQuizAccess, requireUserIdentity } from '../../utils/quizAccess'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  const { quiz_id } = body || {}
  const { userId } = requireUserIdentity(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id is required'
    })
  }

  const client = await pool.connect()

  try {
    await requireQuizAccess(client, event, quiz_id)

    await client.query(
      `
      UPDATE users
      SET current_quiz_id = $1
      WHERE id = $2
      `,
      [quiz_id, userId]
    )

    return { success: true }
  } finally {
    client.release()
  }
})
