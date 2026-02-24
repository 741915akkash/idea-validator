import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { interview_id } = body

  if (!interview_id) {
    throw createError({ statusCode: 400, statusMessage: 'interview_id required' })
  }

  await pool.query(
    `
    UPDATE interviews
    SET finished_at = now()
    WHERE id = $1
    `,
    [interview_id]
  )

  return { ok: true }
})
