import { pool } from '../../../db'
import { requireQuizAccess } from '../../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const { quiz_id, checkpoint } = await readBody(event)

  if (!quiz_id || !checkpoint) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id and checkpoint required'
    })
  }

  const client = await pool.connect()
  try {
    await requireQuizAccess(client, event, quiz_id)

    await client.query(
      `
      UPDATE quiz_state
      SET current_checkpoint = $2,
          last_updated = now()
      WHERE quiz_id = $1
      `,
      [quiz_id, checkpoint]
    )
  } finally {
    client.release()
  }

  return { ok: true }
})
