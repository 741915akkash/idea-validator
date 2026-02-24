import { loadQuizSignals } from '../../services/loadQuizSignals'
import { loadQuizDecision } from '../../services/loadQuizDecision'

export default defineEventHandler(async (event) => {
  const { quiz_id } = getQuery(event)

  if (!quiz_id) {
    return { error: 'quiz_id required' }
  }

  const decision = await loadQuizDecision(quiz_id)
  const signals = await loadQuizSignals(quiz_id)

  return {
    quiz_id,
    decision,
    signals
  }
})
