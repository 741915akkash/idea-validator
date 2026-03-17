import { loadQuizSignals } from '../../services/loadQuizSignals'
import { loadQuizDecision } from '../../services/loadQuizDecision'
import { pool } from '../../db'
import { createError, getQuery } from 'h3'
import { requireQuizAccess } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const { quiz_id } = getQuery(event)

  if (!quiz_id) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  const client = await pool.connect()
  try {
    await requireQuizAccess(client, event, quiz_id)
  } finally {
    client.release()
  }

  const decision = await loadQuizDecision(quiz_id)
  const signals = await loadQuizSignals(quiz_id)

  return {
    quiz_id,
    decision,
    signals
  }
})
