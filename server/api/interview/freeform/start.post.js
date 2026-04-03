import { pool } from '../../../db'
import { requireQuizAccess } from '../../../utils/quizAccess'

const FREEFORM_NORMALIZED_TEXT = '__freeform_template__'
const FREEFORM_UNCERTAINTY_TEXT = '__FREEFORM_TEMPLATE__'
const FREEFORM_SUB_TITLE = 'FREEFORM'
const FREEFORM_GOAL_STATEMENT = 'FREEFORM'
const FREEFORM_CONDITION_DESCRIPTION = 'freeform_randomid'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { quiz_id } = body || {}

  if (!quiz_id) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await requireQuizAccess(client, event, quiz_id)

    // 1) Create/reuse hidden uncertainty template for this quiz.
    let uncertaintyId = null

    const existingUncertaintyRes = await client.query(
      `
      SELECT id
      FROM uncertainties
      WHERE quiz_id = $1
        AND normalized_text = $2
      ORDER BY created_at ASC
      LIMIT 1
      `,
      [quiz_id, FREEFORM_NORMALIZED_TEXT]
    )

    if (existingUncertaintyRes.rows.length) {
      uncertaintyId = existingUncertaintyRes.rows[0].id
    } else {
      const createdUncertaintyRes = await client.query(
        `
        INSERT INTO uncertainties (quiz_id, text, normalized_text, status)
        VALUES ($1, $2, $3, 'hidden')
        RETURNING id
        `,
        [quiz_id, FREEFORM_UNCERTAINTY_TEXT, FREEFORM_NORMALIZED_TEXT]
      )
      uncertaintyId = createdUncertaintyRes.rows[0].id
    }

    // 2) Create/reuse sub-uncertainty.
    let subUncertaintyId = null

    const existingSubRes = await client.query(
      `
      SELECT id
      FROM sub_uncertainties
      WHERE uncertainty_id = $1
        AND title = $2
      ORDER BY created_at ASC
      LIMIT 1
      `,
      [uncertaintyId, FREEFORM_SUB_TITLE]
    )

    if (existingSubRes.rows.length) {
      subUncertaintyId = existingSubRes.rows[0].id
    } else {
      const createdSubRes = await client.query(
        `
        INSERT INTO sub_uncertainties (uncertainty_id, title, description)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [uncertaintyId, FREEFORM_SUB_TITLE, 'Hidden template for freeform interviews']
      )
      subUncertaintyId = createdSubRes.rows[0].id
    }

    // 3) Create/reuse goal.
    let goalId = null

    const existingGoalRes = await client.query(
      `
      SELECT id
      FROM goals
      WHERE sub_uncertainty_id = $1
      ORDER BY created_at ASC
      LIMIT 1
      `,
      [subUncertaintyId]
    )

    if (existingGoalRes.rows.length) {
      goalId = existingGoalRes.rows[0].id
    } else {
      const createdGoalRes = await client.query(
        `
        INSERT INTO goals (sub_uncertainty_id, statement)
        VALUES ($1, $2)
        RETURNING id
        `,
        [subUncertaintyId, FREEFORM_GOAL_STATEMENT]
      )
      goalId = createdGoalRes.rows[0].id
    }

    // 4) Create/reuse single placeholder condition.
    let conditionId = null

    const existingConditionRes = await client.query(
      `
      SELECT id
      FROM conditions
      WHERE goal_id = $1
      ORDER BY order_index ASC NULLS LAST, created_at ASC
      LIMIT 1
      `,
      [goalId]
    )

    if (existingConditionRes.rows.length) {
      conditionId = existingConditionRes.rows[0].id
    } else {
      const createdConditionRes = await client.query(
        `
        INSERT INTO conditions (goal_id, description, evidence_required, order_index)
        VALUES ($1, $2, $3, 1)
        RETURNING id
        `,
        [
          goalId,
          FREEFORM_CONDITION_DESCRIPTION,
          'Used to anchor freeform evidence entries without nullable condition_id'
        ]
      )
      conditionId = createdConditionRes.rows[0].id
    }

    // 5) Create interview execution row.
    const interviewRes = await client.query(
      `
      INSERT INTO interviews (quiz_id, sub_uncertainty_id, status)
      VALUES ($1, $2, 'active')
      RETURNING id
      `,
      [quiz_id, subUncertaintyId]
    )

    const interviewId = interviewRes.rows[0].id

    // 6) Create runtime condition state row.
    await client.query(
      `
      INSERT INTO condition_results (interview_id, condition_id, status)
      VALUES ($1, $2, 'pending')
      `,
      [interviewId, conditionId]
    )

    await client.query('COMMIT')

    return {
      interview_id: interviewId,
      condition_id: conditionId
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})
