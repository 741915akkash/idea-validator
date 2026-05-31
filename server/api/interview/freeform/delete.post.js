import { pool } from '../../../db'
import { requireInterviewAccess } from '../../../utils/interviewAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { interview_id } = body || {}

  if (!interview_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'interview_id required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await requireInterviewAccess(client, event, interview_id, { select: 'i.id' })

    await client.query(
      `
      DELETE FROM interviews
      WHERE id = $1
      `,
      [interview_id]
    )

    await client.query('COMMIT')

    return { success: true }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})
