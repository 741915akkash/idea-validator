import { pool } from '../../db'
import OpenAI from 'openai'
import { scoreDecomposition } from '../../services/interviewEngine/scoreStructure'
import { incrementHit, toVectorLiteral } from '../../services/interviewEngine/cache'
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

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { text } = body

  if (!text || typeof text !== 'string' || !text.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'text required' })
  }

  const { tier, limits } = await getEventEntitlementsFromDb({ event, client: pool })
  const structuredValidationGate = observeFeatureGate(event, {
    mode: 'observe',
    checkpoint: 'uncertainty.generate',
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

  const client = await pool.connect()

  try {
    try {
      const embedding = await getEmbedding(openai, normalizedText)
      const cached = await findSimilarCache({
        client,
        level: 'uncertainty_decomposition',
        embedding
      })

      if (cached && cached.similarity > 0.85) {
        await incrementHit(cached.id)
        return {
          source: 'cache',
          similarity: cached.similarity,
          sub_uncertainties: normalizeSubList(cached.structured_json?.sub_uncertainties)
        }
      }

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

      const { sub_uncertainties } = await executeWithStructuredValidationCharge({
        event,
        client,
        referenceParts: [normalizedText],
        description: 'Structured validation run for uncertainty.generate',
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

      return {
        source: 'llm',
        similarity: null,
        sub_uncertainties
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
        return {
          source: 'cache_text_fallback',
          similarity: null,
          sub_uncertainties: normalizeSubList(textCached.structured_json?.sub_uncertainties)
        }
      }

      return {
        source: 'heuristic_fallback',
        similarity: null,
        sub_uncertainties: heuristicSubUncertainties(text)
      }
    }
  } finally {
    client.release()
  }
})
