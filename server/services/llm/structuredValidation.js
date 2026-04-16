import { createError, getHeader } from 'h3'
import { toVectorLiteral } from '../interviewEngine/cache'
import { extractJSON } from '../interviewEngine/extractJSON'
import { refundCredits, spendCredits } from '../credits'
import { CREDIT_COSTS, CREDIT_FEATURES } from '../../utils/creditCosts'
import { buildCreditReferenceId } from '../../utils/creditReference'

function isTruthy(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
}

export function isCreditsEnabled() {
  if (process.env.CREDITS_ENABLED != null) {
    return isTruthy(process.env.CREDITS_ENABLED)
  }

  return process.env.NODE_ENV === 'production'
}

export function normalizeSemanticText(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export async function getEmbedding(openai, inputText) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: inputText
  })

  return res.data[0].embedding
}

export async function findSimilarCache({
  client,
  level,
  embedding,
  minConfidenceScore = 75
}) {
  const vector = toVectorLiteral(embedding)

  const result = await client.query(
    `
    SELECT id,
           structured_json,
           confidence_score,
           1 - (embedding <=> $1::vector) AS similarity
    FROM interview_cache
    WHERE level = $2
      AND confidence_score >= $3
    ORDER BY embedding <=> $1::vector
    LIMIT 1
    `,
    [vector, level, minConfidenceScore]
  )

  return result.rows[0] || null
}

export async function findCacheByNormalizedText({
  client,
  level,
  normalizedText,
  minConfidenceScore = 75
}) {
  const result = await client.query(
    `
    SELECT id, structured_json
    FROM interview_cache
    WHERE level = $1
      AND normalized_text = $2
      AND confidence_score >= $3
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [level, normalizedText, minConfidenceScore]
  )

  return result.rows[0] || null
}

export async function callJsonCompletion({
  openai,
  prompt,
  model = 'gpt-4o-mini',
  temperature = 0.2
}) {
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature
  })

  const content = response?.choices?.[0]?.message?.content || ''
  return extractJSON(content)
}

export async function spendStructuredValidationCredits({
  event,
  client = null,
  pool = null,
  referenceParts = [],
  description = null
}) {
  if (!isCreditsEnabled()) {
    console.info('[credits][disabled_skip]', JSON.stringify({ description }))
    return {
      success: true,
      duplicate: false,
      charged: false,
      skipped: true
    }
  }

  const userId = event?.context?.user?.id || null
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required for credit-metered structured validation'
    })
  }

  const dbClient = client || (await pool?.connect?.())
  if (!dbClient || typeof dbClient.query !== 'function') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database client unavailable for credit charging'
    })
  }

  const ownsClient = !client

  try {
    const result = await spendCredits({
      client: dbClient,
      userId,
      cost: CREDIT_COSTS[CREDIT_FEATURES.STRUCTURED_VALIDATION_RUN],
      feature: CREDIT_FEATURES.STRUCTURED_VALIDATION_RUN,
      referenceId: buildCreditReferenceId([
        userId,
        CREDIT_FEATURES.STRUCTURED_VALIDATION_RUN,
        ...referenceParts
      ]),
      description
    })

    if (!result.success) {
      throw createError({
        statusCode: 402,
        statusMessage: 'Not enough credits'
      })
    }

    return result
  } finally {
    if (ownsClient) {
      dbClient.release()
    }
  }
}

export async function executeWithStructuredValidationCharge({
  event,
  client = null,
  pool = null,
  referenceParts = [],
  description = null,
  run
}) {
  const userId = event?.context?.user?.id || null
  const normalizedParts = referenceParts.map((part) => String(part || '').trim())
  const chargeReferenceId = buildCreditReferenceId([
    userId,
    CREDIT_FEATURES.STRUCTURED_VALIDATION_RUN,
    ...normalizedParts
  ])
  const refundReferenceId = buildCreditReferenceId([chargeReferenceId, 'refund'])

  if (typeof run !== 'function') {
    throw createError({
      statusCode: 500,
      statusMessage: 'executeWithStructuredValidationCharge requires run() callback'
    })
  }

  const creditResult = await spendStructuredValidationCredits({
    event,
    client,
    pool,
    referenceParts,
    description
  })

  try {
    const forceFailHeader = String(getHeader(event, 'x-credits-smoke-fail') || '')
      .trim()
      .toLowerCase()
    const forceFailEnabled =
      process.env.NODE_ENV !== 'production' &&
      (forceFailHeader === '1' || forceFailHeader === 'true')

    if (forceFailEnabled) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Forced LLM failure for credits smoke check'
      })
    }

    return await run()
  } catch (error) {
    if (creditResult?.charged && userId) {
      const refundDescription = description
        ? `Auto-refund: ${description}`
        : 'Auto-refund for failed structured validation execution'

      const refundClient = client || (await pool?.connect?.())
      const ownsRefundClient = !client

      try {
        await refundCredits({
          client: refundClient,
          userId,
          amount: CREDIT_COSTS[CREDIT_FEATURES.STRUCTURED_VALIDATION_RUN],
          feature: CREDIT_FEATURES.STRUCTURED_VALIDATION_RUN,
          referenceId: refundReferenceId,
          description: `${refundDescription} (original_ref=${chargeReferenceId})`
        })
      } catch (refundError) {
        console.error(
          '[credits][refund_failed]',
          JSON.stringify({
            message: refundError?.message || 'unknown',
            user_id: userId,
            reference_id: refundReferenceId,
            original_reference_id: chargeReferenceId
          })
        )
      } finally {
        if (ownsRefundClient && refundClient) {
          refundClient.release()
        }
      }
    }

    throw error
  }
}
