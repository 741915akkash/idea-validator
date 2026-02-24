import { ruleMatches } from './ruleMatches'

/**
 * Evaluate insight rules against signals.
 */
export function evaluateInsights({ rules, signals, decision, maxPerSection = 5 }) {
  const result = {
    working: [],
    risky: [],
    proceed: []
  }

  for (const rule of rules) {
    if (!rule.active) continue

    if (ruleMatches(rule, signals, decision)) {
      result[rule.section].push(rule)
    }
  }

  // Sort + cap
  for (const section of Object.keys(result)) {
    result[section] = result[section]
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxPerSection)
  }

  return result
}
