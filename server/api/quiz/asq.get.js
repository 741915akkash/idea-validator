import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const { quiz_id, question_id } = getQuery(event)

  if (!quiz_id || !question_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id and question_id are required'
    })
  }

  const client = await pool.connect()
  const { rows } = await client.query(
    `
    SELECT
      a.id,
      a.asq_key,
      a.question_text,
      a.input_type,
      qa.answer_value
    FROM asq_questions a
    LEFT JOIN quiz_asq_answers qa
      ON qa.asq_id = a.id
     AND qa.quiz_id = $1
    WHERE a.question_id = $2
    ORDER BY a.id
    `,
    [quiz_id, question_id]
  )

  return { asqs: rows }
})
