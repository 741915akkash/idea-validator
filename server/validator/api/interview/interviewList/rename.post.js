import { eventHandler, readBody, createError } from 'h3'
import { pool } from '../../../db'
import { requireInterviewAccess } from '../../../utils/interviewAccess'

export default eventHandler(async (event) => {
  const { interview_id, name } = await readBody(event)

  if (!interview_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'interview_id required'
    })
  }

  if (typeof name !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'name must be a string'
    })
  }

  const trimmedName = name.trim()

  if (!trimmedName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'name cannot be empty'
    })
  }

  const client = await pool.connect()
  try {
    await requireInterviewAccess(client, event, interview_id)

    await client.query(
      `
      UPDATE interviews
      SET name = $1
      WHERE id = $2
      `,
      [trimmedName, interview_id]
    )
  } finally {
    client.release()
  }

  return { success: true, interview_id, name: trimmedName }
})
