import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const { interview_id } = getQuery(event)

  if (!interview_id) {
    throw createError({ statusCode: 400, statusMessage: 'interview_id required' })
  }

  const client = await pool.connect()

  try {
    // 1️⃣ Get interview execution row
    const interviewRes = await client.query(
      `
      SELECT *
      FROM interviews
      WHERE id = $1
      `,
      [interview_id]
    )

    if (interviewRes.rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Interview not found' })
    }

    const interview = interviewRes.rows[0]

    // 2️⃣ Get sub_uncertainty
    const subRes = await client.query(
      `
      SELECT *
      FROM sub_uncertainties
      WHERE id = $1
      `,
      [interview.sub_uncertainty_id]
    )

    const sub = subRes.rows[0]

    // 3️⃣ Get goal template
    const goalRes = await client.query(
      `
      SELECT *
      FROM goals
      WHERE sub_uncertainty_id = $1
      `,
      [sub.id]
    )

    const goal = goalRes.rows[0]

    // 4️⃣ Get conditions (template)
    const conditionsRes = await client.query(
      `
      SELECT *
      FROM conditions
      WHERE goal_id = $1
      ORDER BY order_index ASC
      `,
      [goal.id]
    )

    const conditions = conditionsRes.rows

    // 5️⃣ Get questions (template)
    const questionsRes = await client.query(
      `
      SELECT *
      FROM interview_questions
      WHERE goal_id = $1
      ORDER BY order_index ASC
      `,
      [goal.id]
    )

    const questions = questionsRes.rows

    // 6️⃣ Get condition runtime state
    const resultsRes = await client.query(
      `
      SELECT *
      FROM condition_results
      WHERE interview_id = $1
      `,
      [interview_id]
    )

    let conditionResults = resultsRes.rows

    // Backfill runtime rows when template conditions changed after interview creation.
    // This keeps old interviews compatible with newly added/replaced conditions.
    const existingResultConditionIds = new Set(conditionResults.map((row) => String(row.condition_id)))
    const missingConditionIds = conditions
      .map((row) => row.id)
      .filter((conditionId) => !existingResultConditionIds.has(String(conditionId)))

    if (missingConditionIds.length) {
      for (const conditionId of missingConditionIds) {
        await client.query(
          `
          INSERT INTO condition_results (interview_id, condition_id, status)
          VALUES ($1, $2, 'pending')
          `,
          [interview_id, conditionId]
        )
      }

      const refreshedResultsRes = await client.query(
        `
        SELECT *
        FROM condition_results
        WHERE interview_id = $1
        `,
        [interview_id]
      )

      conditionResults = refreshedResultsRes.rows
    }

    // 7️⃣ Get evidence entries
    const evidenceRes = await client.query(
      `
      SELECT *
      FROM evidence_entries
      WHERE interview_id = $1
      ORDER BY created_at ASC
      `,
      [interview_id]
    )

    const evidenceEntries = evidenceRes.rows

    return {
      interview,
      sub_uncertainty: sub,
      goal,
      conditions,
      questions,
      condition_results: conditionResults,
      evidence_entries: evidenceEntries
    }
  } finally {
    client.release()
  }
})
