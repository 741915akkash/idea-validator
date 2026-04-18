import { pool } from '../../../db'
import { requireQuizAccess } from '../../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { quiz_id, question_id, asq_id, answer_value } = body

  if (!quiz_id || !question_id || !asq_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }
  const client = await pool.connect()
  try {
    await requireQuizAccess(client, event, quiz_id)

    await client.query(
      `
      INSERT INTO quiz_asq_answers
        (quiz_id, question_id, asq_id, answer_value)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (quiz_id, asq_id)
      DO UPDATE SET
        answer_value = EXCLUDED.answer_value,
        answered_at = now()
      `,
      [quiz_id, question_id, asq_id, answer_value]
    )
  } finally {
    client.release()
  }

  return { ok: true }
})
