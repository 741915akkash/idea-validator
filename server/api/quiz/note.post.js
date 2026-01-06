import { readBody, createError, eventHandler } from 'h3'
import { pool } from '../../db'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  const { quiz_id, question_id, note_text } = body

  if (!quiz_id || !question_id || note_text === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id, question_id, and note_text are required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query(
      `
      INSERT INTO quiz_question_notes (quiz_id, question_id, note_text)
      VALUES ($1, $2, $3)
      ON CONFLICT (quiz_id, question_id)
      DO UPDATE SET
        note_text = EXCLUDED.note_text,
        updated_at = now()
      `,
      [quiz_id, question_id, note_text]
    )

    return { ok: true }
  } finally {
    client.release()
  }
})
