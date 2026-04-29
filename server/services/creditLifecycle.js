import { createError } from 'h3'

function assertClient(client) {
  if (!client || typeof client.query !== 'function') {
    throw createError({
      statusCode: 500,
      statusMessage: 'A database client with query(...) is required'
    })
  }
}

export async function ensureUserCreditsRow({ client, userId }) {
  assertClient(client)

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId is required'
    })
  }

  await client.query(
    `
    INSERT INTO user_credits (user_id)
    VALUES ($1)
    ON CONFLICT (user_id) DO NOTHING
    `,
    [userId]
  )
}

export async function applyMonthlyCreditsResetIfNeeded({
  client,
  userId,
  at = new Date()
}) {
  assertClient(client)

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId is required'
    })
  }

  await ensureUserCreditsRow({ client, userId })

  const result = await client.query(
    `
    UPDATE user_credits
    SET balance = monthly_allocation,
        updated_at = now()
    WHERE user_id = $1
      AND date_trunc('month', updated_at AT TIME ZONE 'UTC')
        < date_trunc('month', $2::timestamptz AT TIME ZONE 'UTC')
    RETURNING balance::int AS balance,
              monthly_allocation::int AS monthly_allocation,
              updated_at
    `,
    [userId, at]
  )

  return {
    resetApplied: result.rowCount > 0,
    row: result.rows[0] || null
  }
}
