import { createError } from 'h3'

function assertClient(client) {
  if (!client || typeof client.query !== 'function') {
    throw createError({
      statusCode: 500,
      statusMessage: 'A database client with query(...) is required'
    })
  }
}

export async function getUsageGrouped({ client, userId, windowStart }) {
  assertClient(client)

  if (!userId) {
    return []
  }

  if (!windowStart || Number.isNaN(new Date(windowStart).getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'windowStart is required and must be a valid date'
    })
  }

  const { rows } = await client.query(
    `
    SELECT feature, COALESCE(SUM(quantity), 0)::int AS total
    FROM usage_events
    WHERE user_id = $1
      AND created_at >= $2
    GROUP BY feature
    `,
    [userId, windowStart]
  )

  return rows.map((row) => ({
    feature: row.feature,
    total: Number(row.total || 0)
  }))
}

export async function getUsageTotalByFeature({
  client,
  userId,
  feature,
  windowStart
}) {
  assertClient(client)

  if (!userId || !feature) {
    return 0
  }

  if (!windowStart || Number.isNaN(new Date(windowStart).getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'windowStart is required and must be a valid date'
    })
  }

  const { rows } = await client.query(
    `
    SELECT COALESCE(SUM(quantity), 0)::int AS total
    FROM usage_events
    WHERE user_id = $1
      AND feature = $2
      AND created_at >= $3
    `,
    [userId, feature, windowStart]
  )

  return Number(rows[0]?.total || 0)
}
