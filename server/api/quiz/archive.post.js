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

    await requireQuizAccess(client, event, quiz_id)

    await client.query(
      `
      UPDATE quizzes
      SET archived_at = now()
      WHERE id = $1
        AND user_id = $2
        AND archived_at IS NULL
      `,
      [quiz_id, userId]
    )

    const nextQuiz = await client.query(
      `
      SELECT id
      FROM quizzes
      WHERE user_id = $1
        AND archived_at IS NULL
      ORDER BY COALESCE(parent_quiz_id, id), revision_number
      LIMIT 1
      `,
      [userId]
    )

    const nextQuizId = nextQuiz.rows[0]?.id || null

    await client.query(
      `
      UPDATE users
      SET current_quiz_id = $1
      WHERE id = $2
      `,
      [nextQuizId, userId]
    )

    await client.query('COMMIT')

    return {
      success: true,
      next_quiz_id: nextQuizId
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
