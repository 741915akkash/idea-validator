import { createError } from 'h3'
import { requireIdentity } from './quizAccess'

export async function requireInterviewAccess(client, event, interviewId, options = {}) {
  if (!interviewId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'interview_id required'
    })
  }

  const { select = 'i.*' } = options
  const { userId, visitorId } = requireIdentity(event)

  let query
  let params

  if (userId) {
    query = `
      SELECT ${select}
      FROM interviews i
      JOIN quizzes q ON q.id = i.quiz_id
      WHERE i.id = $1
        AND q.user_id = $2
      LIMIT 1
    `
    params = [interviewId, userId]
  } else {
    query = `
      SELECT ${select}
      FROM interviews i
      JOIN quizzes q ON q.id = i.quiz_id
      WHERE i.id = $1
        AND q.visitor_id = $2
      LIMIT 1
    `
    params = [interviewId, visitorId]
  }

  const { rows } = await client.query(query, params)

  if (!rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Interview not found'
    })
  }

  return rows[0]
}
