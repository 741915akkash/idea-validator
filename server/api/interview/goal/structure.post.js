import { pool } from '../../../db'
import OpenAI from 'openai'

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
  const result = await pool.query(
    `
    SELECT id,
           structured_json,
           1 - (embedding <=> $1) AS similarity
    FROM interview_cache
    WHERE level = 'goal_structure'
    ORDER BY embedding <=> $1
    LIMIT 1
    `,
    [embedding]
  )

  return result.rows[0] || null
}

async function storeCache({ goal, normalized, structured, embedding }) {
  await pool.query(
    `
    INSERT INTO interview_cache
    (level, input_text, normalized_text, structured_json, embedding)
    VALUES ('goal_structure', $1, $2, $3, $4)
    `,
    [goal, normalized, structured, embedding]
  )
}

async function incrementHit(id) {
  await pool.query(
    `
    UPDATE interview_cache
    SET hit_count = hit_count + 1
    WHERE id = $1
    `,
    [id]
  )
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { goal } = body

  if (!goal) {
    throw createError({ statusCode: 400, statusMessage: 'goal required' })
  }

  const normalized = normalize(goal)
  const embedding = await getEmbedding(normalized)

  // 🔍 Check similarity cache
  const cached = await findSimilar(embedding)

  if (cached && cached.similarity > 0.88) {
    await incrementHit(cached.id)

    return {
      source: 'cache',
      similarity: cached.similarity,
      data: cached.structured_json
    }
  }

  // 🤖 Call LLM only if no strong match
  const prompt = `
Given this interview goal:

"${goal}"

Generate:
1. 5-7 binary observable CONDITIONS.
2. For each condition, 1-2 concrete sub-questions.

Rules:
- Conditions must be binary
- Must be satisfied by a single answer
- Must avoid hypotheticals
- Must be past-focused
- No opinions
- No "why", "feel", "would"

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

  const structured = JSON.parse(response.choices[0].message.content)

  await storeCache({
    goal,
    normalized,
    structured,
    embedding
  })

  return {
    source: 'llm',
    similarity: null,
    data: structured
  }
})
