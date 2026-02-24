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
    WHERE level = 'decomposition'
    ORDER BY embedding <=> $1
    LIMIT 1
    `,
    [embedding]
  )

  return result.rows[0] || null
}

async function storeCache({ input_text, normalized_text, structured_json, embedding }) {
  await pool.query(
    `
    INSERT INTO interview_cache
    (level, input_text, normalized_text, structured_json, embedding)
    VALUES ('decomposition', $1, $2, $3, $4)
    `,
    [input_text, normalized_text, structured_json, embedding]
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
  const { uncertainty } = body

  if (!uncertainty) {
    throw createError({ statusCode: 400, statusMessage: 'uncertainty required' })
  }

  const normalized = normalize(uncertainty)
  const embedding = await getEmbedding(normalized)

  // 🔍 Check semantic cache
  const cached = await findSimilar(embedding)

  if (cached && cached.similarity > 0.85) {
    await incrementHit(cached.id)

    return {
      source: 'cache',
      similarity: cached.similarity,
      data: cached.structured_json
    }
  }

  // 🤖 Call LLM if no good match
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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  })

  const structured = JSON.parse(response.choices[0].message.content)

  await storeCache({
    input_text: uncertainty,
    normalized_text: normalized,
    structured_json: structured,
    embedding
  })

  return {
    source: 'llm',
    similarity: null,
    data: structured
  }
})
