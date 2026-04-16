import { pool } from '../../../db'
import OpenAI from 'openai'
import { scoreGoalStructure } from '../../../services/interviewEngine/scoreStructure'
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
  const { goal } = body

  if (!goal) {
    throw createError({ statusCode: 400, statusMessage: 'goal required' })
  }

  const { tier, limits } = await getEventEntitlementsFromDb({ event, client: pool })
  observeFeatureGate(event, {
    mode: 'observe',
    checkpoint: 'interview.goal.structure',
    key: 'structuredValidation',
    tier,
    allowed: limits.structuredValidation
  })

  const normalized = normalizeSemanticText(goal)
  const embedding = await getEmbedding(openai, normalized)

  const cached = await findSimilarCache({
    client: pool,
    level: 'goal_structure',
    embedding
  })

  const threshold = 0.88

  if (cached && cached.similarity > threshold && cached.confidence_score >= 75) {
    await incrementHit(cached.id)

    return {
      source: 'cache',
      similarity: cached.similarity,
      data: cached.structured_json
    }
  }

  const prompt = `
Given this interview goal:

"${goal}"

Generate:
1. 5-7 binary observable CONDITIONS.
2. For each condition, 1-2 concrete sub-questions.

Return JSON:
{
  "conditions": [
    {
      "text": "...",
      "questions": ["...", "..."]
    }
  ]
}
`

  const structured = await executeWithStructuredValidationCharge({
    event,
    pool,
    referenceParts: [normalized],
    description: 'Structured validation run for interview.goal.structure',
    run: async () =>
      callJsonCompletion({
        openai,
        prompt,
        temperature: 0.3
      })
  })

  const confidence = scoreGoalStructure(structured)

  await storeCache({
    level: 'goal_structure',
    input_text: goal,
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
