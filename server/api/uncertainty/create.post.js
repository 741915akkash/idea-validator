import { pool } from '../../db'
import OpenAI from 'openai'
import { scoreDecomposition } from '../../services/interviewEngine/scoreStructure'
import { incrementHit, toVectorLiteral } from '../../services/interviewEngine/cache'
import { requireQuizAccess } from '../../utils/quizAccess'
import { getEventEntitlementsFromDb, observeFeatureGate } from '../../utils/track-usage'
import {
  callJsonCompletion,
  findCacheByNormalizedText,
  findSimilarCache,
  getEmbedding,
  normalizeSemanticText,
  executeWithStructuredValidationCharge
} from '../../services/llm/structuredValidation'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function heuristicSubUncertainties(text) {
  const seed = text.trim().replace(/\s+/g, ' ')
  return [
    `Who exactly experiences "${seed}" most often?`,
    `How often does "${seed}" happen in real workflows?`,
    `What are people doing today instead of solving "${seed}"?`,
    `What concrete evidence would prove "${seed}" is high-priority?`,
    `What low-cost test can validate "${seed}" this week?`
  ]
}

function normalizeSubList(items) {
  if (!Array.isArray(items)) return []

  const seen = new Set()
  const normalized = []

  for (const raw of items) {
    const value = typeof raw === 'string' ? raw : raw?.title
    const title = value?.trim()
    if (!title) continue
    const key = title.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push(title)
  }

  return normalized
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { quiz_id, text, sub_uncertainties } = body

  if (!quiz_id || !text) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const { tier, limits } = await getEventEntitlementsFromDb({ event, client: pool })
  const structuredValidationGate = observeFeatureGate(event, {
    mode: 'observe',
    checkpoint: 'uncertainty.create',
    key: 'structuredValidation',
    tier,
    allowed: limits.structuredValidation
  })

  if (structuredValidationGate.wouldBlock) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Structured validation is not available on your current plan'
    })
  }

  const normalizedText = normalizeSemanticText(text)
  let subList = normalizeSubList(sub_uncertainties)

  const client = await pool.connect()
  let inTransaction = false

  try {
    await requireQuizAccess(client, event, quiz_id)

    if (!subList.length) {
      try {
        const embedding = await getEmbedding(openai, normalizedText)
        const cached = await findSimilarCache({
          client,
          level: 'uncertainty_decomposition',
          embedding
        })

        if (cached && cached.similarity > 0.85) {
          await incrementHit(cached.id)
          subList = normalizeSubList(cached.structured_json?.sub_uncertainties)
        } else {
          const prompt = `
Break down the following startup uncertainty into 4-6
narrow, testable sub-uncertainties.

Return JSON:
{
  "sub_uncertainties": ["...", "..."]
}

Uncertainty:
"${text}"
`

          const { sub_uncertainties: generatedSubs } = await executeWithStructuredValidationCharge({
            event,
            client,
            referenceParts: [quiz_id, normalizedText],
            description: `Structured validation run for quiz ${quiz_id}`,
            run: async () => {
              const structured = await callJsonCompletion({
                openai,
                prompt,
                temperature: 0.2
              })
              const sub_uncertainties = normalizeSubList(structured?.sub_uncertainties)

              const confidence = scoreDecomposition(structured)
              const vector = toVectorLiteral(embedding)

              await client.query(
                `
                INSERT INTO interview_cache
                (level, input_text, normalized_text, structured_json, embedding, confidence_score)
                VALUES ('uncertainty_decomposition', $1, $2, $3, $4::vector, $5)
                `,
                [text, normalizedText, structured, vector, confidence]
              )

              return { sub_uncertainties }
            }
          })
          subList = generatedSubs
        }
      } catch (error) {
        if (error?.statusCode) {
          throw error
        }

        const textCached = await findCacheByNormalizedText({
          client,
          level: 'uncertainty_decomposition',
          normalizedText
        })
        if (textCached) {
          await incrementHit(textCached.id)
          subList = normalizeSubList(textCached.structured_json?.sub_uncertainties)
        } else {
          subList = normalizeSubList(heuristicSubUncertainties(text))
        }
      }
    }

    if (!subList.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least one sub-uncertainty is required'
      })
    }

    await client.query('BEGIN')
    inTransaction = true

    const uncertaintyRes = await client.query(
      `
      INSERT INTO uncertainties (quiz_id, text, normalized_text)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [quiz_id, text, normalizedText]
    )

    const uncertaintyId = uncertaintyRes.rows[0].id
    const insertedSubs = []

    for (const subText of subList) {
      const subRes = await client.query(
        `
        INSERT INTO sub_uncertainties (uncertainty_id, title)
        VALUES ($1, $2)
        RETURNING id, title
        `,
        [uncertaintyId, subText]
      )

      insertedSubs.push(subRes.rows[0])
    }

    await client.query('COMMIT')
    inTransaction = false

    return {
      uncertainty_id: uncertaintyId,
      sub_uncertainties: insertedSubs
    }
  } catch (err) {
    if (inTransaction) {
      await client.query('ROLLBACK')
    }
    throw err
  } finally {
    client.release()
  }
})
