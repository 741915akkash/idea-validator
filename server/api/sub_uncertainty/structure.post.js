import { pool } from '../../db'
import OpenAI from 'openai'
import { scoreGoalStructure } from '../../services/interviewEngine/scoreStructure'
import { storeCache, incrementHit, toVectorLiteral } from '../../services/interviewEngine/cache'
import { extractJSON } from '../../services/interviewEngine/extractJSON'

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
    WHERE level = 'sub_uncertainty_goal_structure'
      AND confidence_score >= 75
    ORDER BY embedding <=> $1::vector
    LIMIT 1
    `,
    [vector]
  )

  return result.rows[0] || null
}

function normalizeStructuredConditions(structured) {
  const rows = Array.isArray(structured?.conditions) ? structured.conditions : []

  return rows
    .map((condition) => {
      const description = (condition?.text || condition?.description || '').trim()
      const questions = Array.isArray(condition?.questions)
        ? condition.questions.map((q) => String(q).trim()).filter(Boolean)
        : []
      return { description, questions }
    })
    .filter((condition) => condition.description)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { sub_uncertainty_id, goal } = body

  if (!sub_uncertainty_id || !goal) {
    throw createError({ statusCode: 400, statusMessage: 'sub_uncertainty_id and goal required' })
  }

  const normalized = normalize(goal)
  const embedding = await getEmbedding(normalized)
  const cached = await findSimilar(embedding)
  const threshold = 0.88

  let structured
  let source = 'llm'
  let similarity = null

  if (cached && cached.similarity > threshold && cached.confidence_score >= 75) {
    await incrementHit(cached.id)
    structured = cached.structured_json
    source = 'cache'
    similarity = cached.similarity
  } else {
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

    structured = extractJSON(response.choices[0].message.content)
    const confidence = scoreGoalStructure(structured)

    await storeCache({
      level: 'sub_uncertainty_goal_structure',
      input_text: goal,
      normalized_text: normalized,
      structured_json: structured,
      embedding: embedding,
      confidence_score: confidence
    })
  }

  const parsedConditions = normalizeStructuredConditions(structured)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const goalLookup = await client.query(
      `SELECT id FROM goals WHERE sub_uncertainty_id = $1 LIMIT 1`,
      [sub_uncertainty_id]
    )

    let goalId
    if (goalLookup.rows[0]) {
      const updated = await client.query(
        `
        UPDATE goals
        SET statement = $1
        WHERE id = $2
        RETURNING id
        `,
        [goal, goalLookup.rows[0].id]
      )
      goalId = updated.rows[0].id
    } else {
      const inserted = await client.query(
        `
        INSERT INTO goals (sub_uncertainty_id, statement)
        VALUES ($1, $2)
        RETURNING id
        `,
        [sub_uncertainty_id, goal]
      )
      goalId = inserted.rows[0].id
    }

    await client.query(`DELETE FROM conditions WHERE goal_id = $1`, [goalId])

    const insertedConditions = []
    const insertedQuestions = []

    let conditionIndex = 0
    for (const condition of parsedConditions) {
      const conditionRes = await client.query(
        `
        INSERT INTO conditions (goal_id, description, order_index)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [goalId, condition.description, conditionIndex++]
      )

      const conditionRow = conditionRes.rows[0]
      insertedConditions.push(conditionRow)

      let questionIndex = 0
      for (const q of condition.questions) {
        const questionRes = await client.query(
          `
          INSERT INTO interview_questions (goal_id, condition_id, text, order_index)
          VALUES ($1, $2, $3, $4)
          RETURNING *
          `,
          [goalId, conditionRow.id, q, questionIndex++]
        )
        insertedQuestions.push(questionRes.rows[0])
      }
    }

    await client.query('COMMIT')

    return {
      source,
      similarity,
      goal_id: goalId,
      conditions: insertedConditions,
      questions: insertedQuestions
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})
