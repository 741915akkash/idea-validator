import { eventHandler, readBody, createError } from 'h3'
import { pool } from '../../db'
import { requireQuizAccess, requireWorkspaceAccess } from '../../utils/quizAccess'

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
      select: 'id, parent_quiz_id, workspace_id'
    })
    await requireWorkspaceAccess(client, event, quiz.workspace_id, {
      select: 'id'
    })
    const rootId = quiz.parent_quiz_id || quiz.id

    await client.query(
      `
      UPDATE quizzes
      SET name = $1
      WHERE workspace_id = $2
        AND (id = $3 OR parent_quiz_id = $3)
      `,
      [name.trim(), quiz.workspace_id, rootId]
    )

    return { success: true, root_id: rootId }
  } finally {
    client.release()
  }
})
