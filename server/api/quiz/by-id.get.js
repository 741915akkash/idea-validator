import { eventHandler, getQuery, createError } from 'h3'
import { pool } from '../../db'
import { requireQuizAccess } from '../../utils/quizAccess'

export default eventHandler(async (event) => {
  const { quiz_id } = getQuery(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id required'
    })
  }

  const client = await pool.connect()
  try {
    const quiz = await requireQuizAccess(client, event, quiz_id, { select: 'id, name' })
    return quiz
  } finally {
    client.release()
  }
})
