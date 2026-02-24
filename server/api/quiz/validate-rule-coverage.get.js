import { loadRules } from '../../services/loadRules'
import { loadQuizzesForCoverage } from '../../services/loadQuizzesForCoverage'
import { validateRuleCoverage } from '../../services/validateRuleCoverage'

export default defineEventHandler(async () => {
  const rules = await loadRules()
  const quizzes = await loadQuizzesForCoverage()

  if (quizzes.length === 0) {
    return {
      warning: 'No completed quizzes found',
      total_rules: rules.length,
      unused_count: rules.length,
      unused_rules: rules.map((r) => ({
        id: r.id,
        section: r.section,
        checkpoint: r.checkpoint,
        priority: r.priority
      }))
    }
  }

  return validateRuleCoverage({ rules, quizzes })
})
