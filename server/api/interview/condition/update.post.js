import { pool } from '../../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { condition_id, status } = body

  if (!condition_id || !['unmet', 'fulfilled', 'skipped'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  await pool.query(
    `
    UPDATE interview_conditions
    SET status = $1
    WHERE id = $2
    `,
    [status, condition_id]
  )

  return { ok: true }
})
