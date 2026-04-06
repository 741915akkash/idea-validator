import { eventHandler, readBody, createError } from 'h3'
import { pool } from '../../db'
import { requireQuizAccess, requireUserIdentity } from '../../utils/quizAccess'

export default eventHandler(async (event) => {
  const { quiz_id } = await readBody(event)
  const { userId } = requireUserIdentity(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await requireQuizAccess(client, event, quiz_id, { includeArchived: true })

    const updateResult = await client.query(
      `
      UPDATE quizzes
      SET archived_at = NULL
      WHERE id = $1
        AND user_id = $2
      RETURNING id
      `,
      [quiz_id, userId]
    )

    if (!updateResult.rowCount) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Quiz not found'
      })
    }

    await client.query(
      `
      UPDATE users
      SET current_quiz_id = $1
      WHERE id = $2
      `,
      [quiz_id, userId]
    )

    await client.query('COMMIT')

    return {
      success: true,
      quiz_id
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
