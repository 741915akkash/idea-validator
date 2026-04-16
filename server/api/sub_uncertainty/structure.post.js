import { pool } from '../../db'
import OpenAI from 'openai'
import { scoreGoalStructure } from '../../services/interviewEngine/scoreStructure'
import { storeCache, incrementHit } from '../../services/interviewEngine/cache'
import { requireSubUncertaintyAccess } from '../../utils/subUncertaintyAccess'
import { getEventEntitlementsFromDb, observeFeatureGate } from '../../utils/track-usage'
import {
  callJsonCompletion,
  findSimilarCache,
  getEmbedding,
  normalizeSemanticText,
  executeWithStructuredValidationCharge
} from '../../services/llm/structuredValidation'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

  const { tier, limits } = await getEventEntitlementsFromDb({ event, client: pool })
  observeFeatureGate(event, {
    mode: 'observe',
    checkpoint: 'sub_uncertainty.structure',
    key: 'structuredValidation',
    tier,
    allowed: limits.structuredValidation
  })

  const normalized = normalizeSemanticText(goal)
  const embedding = await getEmbedding(openai, normalized)
  const cached = await findSimilarCache({
    client: pool,
    level: 'sub_uncertainty_goal_structure',
    embedding
  })
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

    structured = await executeWithStructuredValidationCharge({
      event,
      pool,
      referenceParts: [sub_uncertainty_id, normalized],
      description: `Structured validation run for sub_uncertainty ${sub_uncertainty_id}`,
      run: async () =>
        callJsonCompletion({
          openai,
          prompt,
          temperature: 0.3
        })
    })
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
    await requireSubUncertaintyAccess(client, event, sub_uncertainty_id)

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
