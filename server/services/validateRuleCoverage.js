import { ruleMatches } from './ruleMatches'

/**
 * Validate which rules are never triggered
 * across all scored quizzes.
 */
export async function validateRuleCoverage({ rules, quizzes }) {
  const coverage = {}

  // init
  for (const rule of rules) {
    coverage[rule.id] = {
      rule,
      matches: 0
    }
  }

  // evaluate
  for (const quiz of quizzes) {
    const { signals, decision } = quiz

    for (const rule of rules) {
      if (!rule.active) continue

      if (ruleMatches(rule, signals, decision)) {
        coverage[rule.id].matches++
      }
    }
  }

  // extract unused rules
  const unused = Object.values(coverage)
    .filter((r) => r.matches === 0)
    .map((r) => ({
      id: r.rule.id,
      section: r.rule.section,
      checkpoint: r.rule.checkpoint,
      priority: r.rule.priority,
      conditions: r.rule.conditions,
      copy: r.rule.copy
    }))

  return {
    total_rules: rules.length,
    unused_count: unused.length,
    unused_rules: unused
  }
}
