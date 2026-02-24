import { getQuery, createError, eventHandler } from 'h3'
import { pool } from '../../../db'

export default eventHandler(async (event) => {
  const { quiz_id, question_id } = getQuery(event)

  if (!quiz_id || !question_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id and question_id are required'
    })
  }

  const client = await pool.connect()

  try {
    const res = await client.query(
      `
      SELECT note_text
      FROM quiz_question_notes
      WHERE quiz_id = $1 AND question_id = $2
      `,
      [quiz_id, question_id]
    )

    return {
      note_text: res.rows[0]?.note_text || ''
    }
  } finally {
    client.release()
  }
})
