/**
 * Check whether a rule matches given signals + decision.
 *
 * Rules:
 * - ALL conditions must match
 * - Arrays mean "any of"
 * - Missing signal = no match
 */

export function ruleMatches(rule, signals, decision) {
  const conditions = rule.conditions || {}

  for (const [key, expected] of Object.entries(conditions)) {
    // Decision condition (META)
    if (key === 'decision') {
      if (decision !== expected) return false
      continue
    }

    // Signal condition
    const checkpoint = rule.checkpoint
    const value = signals?.[checkpoint]?.[key]

    if (value === undefined) return false

    if (Array.isArray(expected)) {
      if (!expected.includes(value)) return false
    } else {
      if (value !== expected) return false
    }
  }

  return true
}
