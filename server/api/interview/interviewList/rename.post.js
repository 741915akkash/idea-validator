import { eventHandler, readBody, createError } from 'h3'
import { pool } from '../../../db'

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

  const { rowCount } = await pool.query(
    `
    UPDATE interviews
    SET name = $1
    WHERE id = $2
    `,
    [trimmedName, interview_id]
  )

  if (!rowCount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Interview not found'
    })
  }

  return { success: true, interview_id, name: trimmedName }
})
