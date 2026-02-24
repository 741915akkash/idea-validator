import { loadQuizSignals } from '../../services/loadQuizSignals'
import { loadQuizDecision } from '../../services/loadQuizDecision'
import { loadRules } from '../../services/loadRules'
import { evaluateInsights } from '../../services/evaluateInsights'

export default defineEventHandler(async (event) => {
  const { quiz_id } = getQuery(event)

  if (!quiz_id) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  const signals = await loadQuizSignals(quiz_id)
  const decision = await loadQuizDecision(quiz_id)
  const rules = await loadRules()

  const insights = evaluateInsights({
    rules,
    signals,
    decision
  })

  return {
    decision,
    insights
  }
})
