import { loadQuizSignals } from '../../services/loadQuizSignals'
import { loadQuizDecision } from '../../services/loadQuizDecision'
import { loadRules } from '../../services/loadRules'
import { evaluateInsights } from '../../services/evaluateInsights'
import { pool } from '../../db'
import { requireQuizAccess } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const { quiz_id } = getQuery(event)

  if (!quiz_id) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  const client = await pool.connect()
  let quiz
  try {
    quiz = await requireQuizAccess(client, event, quiz_id, {
      select: 'id, user_id'
    })
  } finally {
    client.release()
  }

  const signals = await loadQuizSignals(quiz_id)
  const decision = await loadQuizDecision(quiz_id)
  const rules = await loadRules()

  const insights = evaluateInsights({
    rules,
    signals,
    decision
  })

  const isVisitorQuiz = !quiz.user_id
  if (isVisitorQuiz) {
    const previewInsights = {
      working: insights.working.slice(0, 1),
      risky: insights.risky.slice(0, 1),
      proceed: insights.proceed.slice(0, 1)
    }

    return {
      decision,
      insights: previewInsights,
      locked: true
    }
  }

  return {
    decision,
    insights,
    locked: false
  }
})
