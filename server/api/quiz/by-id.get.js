import { eventHandler, getQuery, createError } from 'h3'
import { pool } from '../../db'

export default eventHandler(async (event) => {
  const { quiz_id } = getQuery(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id required'
    })
  }

  const { rows } = await pool.query(
    `
    SELECT id, name
    FROM quizzes
    WHERE id = $1
    LIMIT 1
    `,
    [quiz_id]
  )

  if (!rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Quiz not found'
    })
  }

  return rows[0]
})
