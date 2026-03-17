import { pool } from '../../db'
import { requireInterviewAccess } from '../../utils/interviewAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { interview_id } = body

  if (!interview_id) {
    throw createError({ statusCode: 400, statusMessage: 'interview_id required' })
  }

  const client = await pool.connect()
  try {
    await requireInterviewAccess(client, event, interview_id)

    await client.query(
      `
      UPDATE interviews
      SET finished_at = now()
      WHERE id = $1
      `,
      [interview_id]
    )
  } finally {
    client.release()
  }

  return { ok: true }
})
