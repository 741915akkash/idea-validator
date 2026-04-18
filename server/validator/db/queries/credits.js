import { createError } from 'h3'
import {
  applyMonthlyCreditsResetIfNeeded,
  ensureUserCreditsRow
} from '../../services/creditLifecycle.js'

function assertClient(client) {
  if (!client || typeof client.query !== 'function') {
    throw createError({
      statusCode: 500,
      statusMessage: 'A database client with query(...) is required'
    })
  }
}

function monthWindowUTC(inputDate = new Date()) {
  const year = inputDate.getUTCFullYear()
  const month = inputDate.getUTCMonth()
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0))
  return { start, end }
}

export async function getCreditsSnapshot({ client, userId, at = new Date() }) {
  assertClient(client)

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId is required'
    })
  }

  await ensureUserCreditsRow({ client, userId })
  await applyMonthlyCreditsResetIfNeeded({ client, userId, at })

  const { rows: creditsRows } = await client.query(
    `
    SELECT balance::int AS balance,
           monthly_allocation::int AS monthly_allocation
    FROM user_credits
    WHERE user_id = $1
    LIMIT 1
    `,
    [userId]
  )

  const { start, end } = monthWindowUTC(at)

  const { rows: usageRows } = await client.query(
    `
    SELECT COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0)::int AS used
    FROM credit_events
    WHERE user_id = $1
      AND created_at >= $2
      AND created_at < $3
    `,
    [userId, start, end]
  )

  return {
    balance: Number(creditsRows[0]?.balance || 0),
    monthly_allocation: Number(creditsRows[0]?.monthly_allocation || 0),
    used: Number(usageRows[0]?.used || 0),
    resets_at: end.toISOString()
  }
}

export async function getCreditEvents({ client, userId, limit = 50 }) {
  assertClient(client)

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId is required'
    })
  }

  const normalizedLimit = Number(limit)
  if (!Number.isInteger(normalizedLimit) || normalizedLimit <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'limit must be a positive integer'
    })
  }

  const boundedLimit = Math.min(normalizedLimit, 200)

  const { rows } = await client.query(
    `
    SELECT id,
           amount::int AS amount,
           feature,
           reference_id,
           description,
           created_at
    FROM credit_events
    WHERE user_id = $1
    ORDER BY created_at DESC, id DESC
    LIMIT $2
    `,
    [userId, boundedLimit]
  )

  return rows
}

export async function getRecentCreditEventsAdmin({
  client,
  limit = 100,
  userId = null
}) {
  assertClient(client)

  const normalizedLimit = Number(limit)
  if (!Number.isInteger(normalizedLimit) || normalizedLimit <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'limit must be a positive integer'
    })
  }

  const boundedLimit = Math.min(normalizedLimit, 500)

  const params = []
  let whereClause = ''
  if (userId) {
    params.push(userId)
    whereClause = `WHERE ce.user_id = $${params.length}`
  }

  params.push(boundedLimit)

  const { rows } = await client.query(
    `
    SELECT ce.id,
           ce.user_id,
           u.email AS user_email,
           ce.amount::int AS amount,
           ce.feature,
           ce.reference_id,
           ce.description,
           ce.created_at
    FROM credit_events ce
    LEFT JOIN users u ON u.id = ce.user_id
    ${whereClause}
    ORDER BY ce.created_at DESC, ce.id DESC
    LIMIT $${params.length}
    `,
    params
  )

  return rows
}
