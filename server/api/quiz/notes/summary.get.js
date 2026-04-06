// server/api/quiz/notes/summary.get.js
import { getQuery, createError, eventHandler } from 'h3'
import { pool } from '../../../db'
import { requireQuizAccess } from '../../../utils/quizAccess'

export default eventHandler(async (event) => {
  const { quiz_id } = getQuery(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id is required'
    })
  }

  const client = await pool.connect()

  try {
    await requireQuizAccess(client, event, quiz_id, { includeArchived: true })

    const res = await client.query(
      `
      SELECT DISTINCT
        n.question_id,
        q.checkpoint
      FROM quiz_question_notes n
      JOIN questions q ON q.id = n.question_id
      WHERE n.quiz_id = $1
        AND trim(n.note_text) <> ''
      `,
      [quiz_id]
    )

    return {
      question_ids: [...new Set(res.rows.map((r) => r.question_id))],
      checkpoints: [...new Set(res.rows.map((r) => r.checkpoint))]
    }
  } finally {
    client.release()
  }
})
