import { pool } from '../../db'
import OpenAI from 'openai'
import { scoreDecomposition } from '../../services/interviewEngine/scoreStructure'
import { incrementHit, toVectorLiteral } from '../../services/interviewEngine/cache'
import { extractJSON } from '../../services/interviewEngine/extractJSON'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function normalize(text) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ')
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

async function getEmbedding(text) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  })
  return res.data[0].embedding
}

async function findSimilar(client, embedding) {
  const vector = toVectorLiteral(embedding)

  const result = await client.query(
    `
    SELECT id,
           structured_json,
           confidence_score,
           1 - (embedding <=> $1::vector) AS similarity
    FROM interview_cache
    WHERE level = 'uncertainty_decomposition'
      AND confidence_score >= 75
    ORDER BY embedding <=> $1::vector
    LIMIT 1
    `,
    [vector]
  )

  return result.rows[0] || null
}

async function findByNormalizedText(client, normalizedText) {
  const result = await client.query(
    `
    SELECT id, structured_json
    FROM interview_cache
    WHERE level = 'uncertainty_decomposition'
      AND normalized_text = $1
      AND confidence_score >= 75
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [normalizedText]
  )

  return result.rows[0] || null
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

  const normalizedText = normalize(text)

  const client = await pool.connect()

  try {
    try {
      const embedding = await getEmbedding(normalizedText)
      const cached = await findSimilar(client, embedding)

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

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })

      const structured = extractJSON(response.choices[0].message.content)
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

      return {
        source: 'llm',
        similarity: null,
        sub_uncertainties
      }
    } catch {
      const textCached = await findByNormalizedText(client, normalizedText)
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
