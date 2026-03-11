import { pool } from '../../../db'
import OpenAI from 'openai'
import { scoreGoalStructure } from '../../../services/interviewEngine/scoreStructure'
import { storeCache, incrementHit, toVectorLiteral } from '../../../services/interviewEngine/cache'
import { extractJSON } from '../../../services/interviewEngine/extractJSON'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function normalize(text) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ')
}

async function getEmbedding(text) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  })
  return res.data[0].embedding
}

async function findSimilar(embedding) {
  const vector = toVectorLiteral(embedding)

  const result = await pool.query(
    `
    SELECT id,
           structured_json,
           confidence_score,
           1 - (embedding <=> $1::vector) AS similarity
    FROM interview_cache
    WHERE level = 'goal_structure'
      AND confidence_score >= 75
    ORDER BY embedding <=> $1::vector
    LIMIT 1
    `,
    [vector]
  )

  return result.rows[0] || null
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { goal } = body

  if (!goal) {
    throw createError({ statusCode: 400, statusMessage: 'goal required' })
  }

  const normalized = normalize(goal)
  const embedding = await getEmbedding(normalized)

  const cached = await findSimilar(embedding)

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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  const structured = extractJSON(response.choices[0].message.content)
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
