import { createError } from 'h3'
import { requireIdentity } from './quizAccess'

function ownerPredicate(userId) {
  return userId
    ? { clause: 'q.user_id = $2', value: userId }
    : { clause: 'q.visitor_id = $2', value: null }
}

export async function requireUncertaintyAccess(client, event, uncertaintyId, options = {}) {
  if (!uncertaintyId) {
    throw createError({ statusCode: 400, statusMessage: 'uncertainty_id required' })
  }

  const { select = 'u.*' } = options
  const { userId, visitorId } = requireIdentity(event)
  const owner = ownerPredicate(userId)
  const ownerValue = userId || visitorId

  const { rows } = await client.query(
    `
    SELECT ${select}
    FROM uncertainties u
    JOIN quizzes q ON q.id = u.quiz_id
    WHERE u.id = $1
      AND ${owner.clause}
    LIMIT 1
    `,
    [uncertaintyId, ownerValue]
  )

  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Uncertainty not found' })
  }

  return rows[0]
}

export async function requireSubUncertaintyAccess(client, event, subUncertaintyId, options = {}) {
  if (!subUncertaintyId) {
    throw createError({ statusCode: 400, statusMessage: 'sub_uncertainty_id required' })
  }

  const { select = 's.*' } = options
  const { userId, visitorId } = requireIdentity(event)
  const owner = ownerPredicate(userId)
  const ownerValue = userId || visitorId

  const { rows } = await client.query(
    `
    SELECT ${select}
    FROM sub_uncertainties s
    JOIN uncertainties u ON u.id = s.uncertainty_id
    JOIN quizzes q ON q.id = u.quiz_id
    WHERE s.id = $1
      AND ${owner.clause}
    LIMIT 1
    `,
    [subUncertaintyId, ownerValue]
  )

  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Sub-uncertainty not found' })
  }

  return rows[0]
}

export async function requireGoalAccess(client, event, goalId, options = {}) {
  if (!goalId) {
    throw createError({ statusCode: 400, statusMessage: 'goal_id required' })
  }

  const { select = 'g.*' } = options
  const { userId, visitorId } = requireIdentity(event)
  const owner = ownerPredicate(userId)
  const ownerValue = userId || visitorId

  const { rows } = await client.query(
    `
    SELECT ${select}
    FROM goals g
    JOIN sub_uncertainties s ON s.id = g.sub_uncertainty_id
    JOIN uncertainties u ON u.id = s.uncertainty_id
    JOIN quizzes q ON q.id = u.quiz_id
    WHERE g.id = $1
      AND ${owner.clause}
    LIMIT 1
    `,
    [goalId, ownerValue]
  )

  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Goal not found' })
  }

  return rows[0]
}
