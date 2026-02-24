import { pool } from '../../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { goal_id, text } = body

  if (!goal_id || !text) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const { rows } = await pool.query(
    `
    INSERT INTO interview_conditions (goal_id, text)
    VALUES ($1, $2)
    RETURNING *
    `,
    [goal_id, text]
  )

  return rows[0]
})
