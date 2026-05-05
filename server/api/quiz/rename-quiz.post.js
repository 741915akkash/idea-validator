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
    const quiz = await requireQuizAccess(client, event, quiz_id, {
      select: 'id, parent_quiz_id'
    })
    const rootId = quiz.parent_quiz_id || quiz.id

    await client.query(
      `
      UPDATE quizzes
      SET name = $1
      WHERE id = $2 OR parent_quiz_id = $2
      `,
      [name.trim(), rootId]
    )

    return { success: true, root_id: rootId }
  } finally {
    client.release()
  }
})
