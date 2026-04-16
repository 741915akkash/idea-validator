export const CREDIT_FEATURES = {
  STRUCTURED_VALIDATION_RUN: 'structured_validation_run',
  CONDITION_EVALUATION: 'condition_evaluation'
}

export const CREDIT_COSTS = Object.freeze({
  [CREDIT_FEATURES.STRUCTURED_VALIDATION_RUN]: 10,
  [CREDIT_FEATURES.CONDITION_EVALUATION]: 1
})

export function getCreditCost(feature) {
  const key = String(feature || '').trim()
  return CREDIT_COSTS[key] ?? null
}
