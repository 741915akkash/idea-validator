import { createError } from 'h3'
import {
  applyMonthlyCreditsResetIfNeeded,
  ensureUserCreditsRow
} from './creditLifecycle.js'

function assertClient(client) {
  if (!client || typeof client.query !== 'function') {
    throw createError({
      statusCode: 500,
      statusMessage: 'A database client with query(...) is required'
    })
  }
}

function normalizeText(value) {
  return String(value || '').trim()
}

function logCreditEvent(type, payload = {}) {
  console.info(`[credits][${type}]`, JSON.stringify(payload))
}

export async function spendCredits({
  client,
  userId,
  cost,
  feature,
  referenceId,
  description = null,
  manageTransaction = true
}) {
  assertClient(client)

  const normalizedUserId = normalizeText(userId)
  const normalizedFeature = normalizeText(feature)
  const normalizedReferenceId = normalizeText(referenceId)
  const normalizedDescription = description == null ? null : String(description)
  const normalizedCost = Number(cost)

  if (!normalizedUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'spendCredits requires userId'
    })
  }

  if (!normalizedFeature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'spendCredits requires feature'
    })
  }

  if (!normalizedReferenceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'spendCredits requires referenceId for idempotency'
    })
  }

  if (!Number.isInteger(normalizedCost) || normalizedCost <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'spendCredits requires cost as a positive integer'
    })
  }

  let finishedTransaction = false

  try {
    if (manageTransaction) {
      await client.query('BEGIN')
    }

    await ensureUserCreditsRow({ client, userId: normalizedUserId })
    await applyMonthlyCreditsResetIfNeeded({ client, userId: normalizedUserId })

    const insertEventResult = await client.query(
      `
      INSERT INTO credit_events (
        user_id,
        amount,
        feature,
        reference_id,
        description
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, feature, reference_id)
      WHERE reference_id IS NOT NULL
      DO NOTHING
      RETURNING id
      `,
      [
        normalizedUserId,
        -normalizedCost,
        normalizedFeature,
        normalizedReferenceId,
        normalizedDescription
      ]
    )

    if (insertEventResult.rowCount === 0) {
      const { rows } = await client.query(
        'SELECT balance::int AS balance FROM user_credits WHERE user_id = $1',
        [normalizedUserId]
      )

      if (manageTransaction) {
        await client.query('COMMIT')
      }
      finishedTransaction = true

      logCreditEvent('spend_duplicate', {
        user_id: normalizedUserId,
        feature: normalizedFeature,
        reference_id: normalizedReferenceId,
        balance: Number(rows[0]?.balance || 0)
      })

      return {
        success: true,
        duplicate: true,
        charged: false,
        balance: Number(rows[0]?.balance || 0)
      }
    }

    const updateBalanceResult = await client.query(
      `
      UPDATE user_credits
      SET balance = balance - $1,
          updated_at = now()
      WHERE user_id = $2
        AND balance >= $1
      RETURNING balance::int AS balance
      `,
      [normalizedCost, normalizedUserId]
    )

    if (updateBalanceResult.rowCount === 0) {
      if (manageTransaction) {
        await client.query('ROLLBACK')
      }
      finishedTransaction = true

      logCreditEvent('spend_insufficient', {
        user_id: normalizedUserId,
        feature: normalizedFeature,
        reference_id: normalizedReferenceId,
        requested_cost: normalizedCost
      })

      return {
        success: false,
        reason: 'insufficient_credits'
      }
    }

    if (manageTransaction) {
      await client.query('COMMIT')
    }
    finishedTransaction = true

    logCreditEvent('spend_applied', {
      user_id: normalizedUserId,
      feature: normalizedFeature,
      reference_id: normalizedReferenceId,
      cost: normalizedCost,
      balance: Number(updateBalanceResult.rows[0]?.balance || 0)
    })

    return {
      success: true,
      duplicate: false,
      charged: true,
      balance: Number(updateBalanceResult.rows[0]?.balance || 0)
    }
  } catch (error) {
    logCreditEvent('spend_error', {
      user_id: normalizedUserId,
      feature: normalizedFeature,
      reference_id: normalizedReferenceId,
      message: error?.message || 'unknown_error'
    })

    if (!finishedTransaction && manageTransaction) {
      try {
        await client.query('ROLLBACK')
      } catch {
        // Ignore rollback errors to preserve original failure.
      }
    }

    throw error
  }
}

export async function refundCredits({
  client,
  userId,
  amount,
  feature,
  referenceId,
  description = null,
  manageTransaction = true
}) {
  assertClient(client)

  const normalizedUserId = normalizeText(userId)
  const normalizedFeature = normalizeText(feature)
  const normalizedReferenceId = normalizeText(referenceId)
  const normalizedDescription = description == null ? null : String(description)
  const normalizedAmount = Number(amount)

  if (!normalizedUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'refundCredits requires userId'
    })
  }

  if (!normalizedFeature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'refundCredits requires feature'
    })
  }

  if (!normalizedReferenceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'refundCredits requires referenceId for idempotency'
    })
  }

  if (!Number.isInteger(normalizedAmount) || normalizedAmount <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'refundCredits requires amount as a positive integer'
    })
  }

  let finishedTransaction = false

  try {
    if (manageTransaction) {
      await client.query('BEGIN')
    }

    await ensureUserCreditsRow({ client, userId: normalizedUserId })

    const insertEventResult = await client.query(
      `
      INSERT INTO credit_events (
        user_id,
        amount,
        feature,
        reference_id,
        description
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, feature, reference_id)
      WHERE reference_id IS NOT NULL
      DO NOTHING
      RETURNING id
      `,
      [
        normalizedUserId,
        normalizedAmount,
        normalizedFeature,
        normalizedReferenceId,
        normalizedDescription
      ]
    )

    if (insertEventResult.rowCount === 0) {
      const { rows } = await client.query(
        'SELECT balance::int AS balance FROM user_credits WHERE user_id = $1',
        [normalizedUserId]
      )

      if (manageTransaction) {
        await client.query('COMMIT')
      }
      finishedTransaction = true

      logCreditEvent('refund_duplicate', {
        user_id: normalizedUserId,
        feature: normalizedFeature,
        reference_id: normalizedReferenceId,
        balance: Number(rows[0]?.balance || 0)
      })

      return {
        success: true,
        duplicate: true,
        refunded: false,
        balance: Number(rows[0]?.balance || 0)
      }
    }

    const updateBalanceResult = await client.query(
      `
      UPDATE user_credits
      SET balance = balance + $1,
          updated_at = now()
      WHERE user_id = $2
      RETURNING balance::int AS balance
      `,
      [normalizedAmount, normalizedUserId]
    )

    if (manageTransaction) {
      await client.query('COMMIT')
    }
    finishedTransaction = true

    logCreditEvent('refund_applied', {
      user_id: normalizedUserId,
      feature: normalizedFeature,
      reference_id: normalizedReferenceId,
      amount: normalizedAmount,
      balance: Number(updateBalanceResult.rows[0]?.balance || 0)
    })

    return {
      success: true,
      duplicate: false,
      refunded: true,
      balance: Number(updateBalanceResult.rows[0]?.balance || 0)
    }
  } catch (error) {
    logCreditEvent('refund_error', {
      user_id: normalizedUserId,
      feature: normalizedFeature,
      reference_id: normalizedReferenceId,
      message: error?.message || 'unknown_error'
    })

    if (!finishedTransaction && manageTransaction) {
      try {
        await client.query('ROLLBACK')
      } catch {
        // Ignore rollback errors to preserve original failure.
      }
    }
    throw error
  }
}
