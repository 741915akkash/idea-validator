import { pool } from '../../../db'
import OpenAI from 'openai'
import { scoreDecomposition } from '../../../services/interviewEngine/scoreStructure'
import { storeCache, incrementHit } from '../../../services/interviewEngine/cache'
import { getEventEntitlementsFromDb, observeFeatureGate } from '../../../utils/track-usage'
import {
  callJsonCompletion,
  findSimilarCache,
  getEmbedding,
  normalizeSemanticText,
  executeWithStructuredValidationCharge
} from '../../../services/llm/structuredValidation'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { uncertainty } = body

  if (!uncertainty) {
    throw createError({ statusCode: 400, statusMessage: 'uncertainty required' })
  }

  const { tier, limits } = await getEventEntitlementsFromDb({ event, client: pool })
  observeFeatureGate(event, {
    mode: 'observe',
    checkpoint: 'interview.uncertainty.decompose',
    key: 'structuredValidation',
    tier,
    allowed: limits.structuredValidation
  })

  const normalized = normalizeSemanticText(uncertainty)
  const embedding = await getEmbedding(openai, normalized)

  const cached = await findSimilarCache({
    client: pool,
    level: 'uncertainty_decomposition',
    embedding
  })

  const threshold = 0.85

  if (cached && cached.similarity > threshold && cached.confidence_score >= 75) {
    await incrementHit(cached.id)

    return {
      source: 'cache',
      similarity: cached.similarity,
      data: cached.structured_json
    }
  }

  const prompt = `
Break down the following startup uncertainty into 4-6
narrow, testable sub-uncertainties.

Rules:
- Each must focus on a single unknown
- Must be specific and bounded
- Avoid vague wording
- Avoid opinions
- Avoid combining multiple assumptions

Return JSON:
{
  "sub_uncertainties": [
    "...",
    "..."
  ]
}

Uncertainty:
"${uncertainty}"
`

  const structured = await executeWithStructuredValidationCharge({
    event,
    pool,
    referenceParts: [normalized],
    description: 'Structured validation run for interview.uncertainty.decompose',
    run: async () =>
      callJsonCompletion({
        openai,
        prompt,
        temperature: 0.2
      })
  })

  const confidence = scoreDecomposition(structured)

  await storeCache({
    level: 'uncertainty_decomposition',
    input_text: uncertainty,
    normalized_text: normalized,
    structured_json: structured,
    embedding: embedding,
    confidence_score: confidence
  })

  return {
    source: 'llm',
    similarity: null,
    data: structured,
    confidence: confidence
  }
})
