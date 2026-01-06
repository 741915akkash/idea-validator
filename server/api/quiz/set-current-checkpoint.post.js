import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const { quiz_id, checkpoint } = await readBody(event)

  if (!quiz_id || !checkpoint) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id and checkpoint required'
    })
  }

  await pool.query(
    `
    UPDATE quiz_state
    SET current_checkpoint = $2,
        last_updated = now()
    WHERE quiz_id = $1
    `,
    [quiz_id, checkpoint]
  )

  return { ok: true }
})
