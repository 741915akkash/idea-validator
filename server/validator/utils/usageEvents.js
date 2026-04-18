import { createError } from 'h3'
import { FEATURES } from './features.js'

export const USAGE_FEATURES = {
  FREEFORM_INTERVIEW: FEATURES.FREEFORM_INTERVIEWS
}

const REFERENCE_REQUIRED_FEATURES = new Set([
  USAGE_FEATURES.FREEFORM_INTERVIEW
])

export async function recordUsageEvent({
  userId,
  feature,
  referenceId = null,
  idempotencyKey = null,
  quantity = 1,
  metadata = {},
  client
}) {
  if (!client || typeof client.query !== 'function') {
    throw createError({
      statusCode: 500,
      statusMessage: 'recordUsageEvent requires a database client'
    })
  }

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'recordUsageEvent requires userId'
    })
  }

  const normalizedFeature = String(feature || '').trim()
  if (!normalizedFeature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'recordUsageEvent requires feature'
    })
  }

  const normalizedQuantity = Number(quantity)
  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'recordUsageEvent requires quantity as a positive integer'
    })
  }

  const normalizedIdempotencyKey =
    idempotencyKey == null ? null : String(idempotencyKey).trim() || null
  const normalizedReferenceId = referenceId || null

  if (REFERENCE_REQUIRED_FEATURES.has(normalizedFeature) && !normalizedReferenceId) {
    throw createError({
      statusCode: 400,
      statusMessage: `recordUsageEvent requires referenceId for feature "${normalizedFeature}"`
    })
  }

  const result = await client.query(
    `
    INSERT INTO usage_events (
      user_id,
      feature,
      reference_id,
      idempotency_key,
      quantity,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    ON CONFLICT DO NOTHING
    RETURNING id
    `,
    [
      userId,
      normalizedFeature,
      normalizedReferenceId,
      normalizedIdempotencyKey,
      normalizedQuantity,
      JSON.stringify(metadata || {})
    ]
  )

  return { inserted: result.rowCount > 0 }
}
