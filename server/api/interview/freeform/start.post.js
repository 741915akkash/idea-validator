import { pool } from '../../../db'
import { requireQuizAccess } from '../../../utils/quizAccess'
import {
  getEventEntitlementsFromDb,
  getUsageSnapshot,
  observeCountLimit
} from '../../../utils/track-usage'
import { recordUsageEvent } from '../../../utils/usageEvents'
import { FEATURES } from '../../../utils/features.js'
import { getIdentity } from '../../../utils/quizAccess'

const FREEFORM_NORMALIZED_TEXT = '__freeform_template__'
const FREEFORM_UNCERTAINTY_TEXT = '__FREEFORM_TEMPLATE__'
const FREEFORM_SUB_TITLE = 'FREEFORM'
const FREEFORM_GOAL_STATEMENT = 'FREEFORM'
const FREEFORM_CONDITION_DESCRIPTION = 'freeform_randomid'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { quiz_id, template_id = null, idempotency_key } = body || {}

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await requireQuizAccess(client, event, quiz_id)

    const { tier, limits } = await getEventEntitlementsFromDb({
      event,
      client
    })

    const usage = await getUsageSnapshot(client, event, {
      quizId: quiz_id
    })

    const freeformLimitCheck = observeCountLimit(event, {
      mode: 'observe',
      checkpoint: 'interview.freeform.start',
      key: 'freeformInterviewsPerIdeaPerMonth',
      tier,
      used: usage.freeformInterviewsForIdeaThisMonth ?? 0,
      limit: limits.freeformInterviewsPerIdeaPerMonth,
      increment: 1
    })

    if (freeformLimitCheck.wouldBlock) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Freeform interview limit reached for this idea in the current period'
      })
    }

    // --------------------------------------------------
    // 1. Create/reuse hidden uncertainty template
    // --------------------------------------------------

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
        INSERT INTO uncertainties (
          quiz_id,
          text,
          normalized_text,
          status
        )
        VALUES ($1, $2, $3, 'hidden')
        RETURNING id
        `,
        [quiz_id, FREEFORM_UNCERTAINTY_TEXT, FREEFORM_NORMALIZED_TEXT]
      )

      uncertaintyId = createdUncertaintyRes.rows[0].id
    }

    // --------------------------------------------------
    // 2. Create/reuse sub uncertainty
    // --------------------------------------------------

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
        INSERT INTO sub_uncertainties (
          uncertainty_id,
          title,
          description
        )
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [uncertaintyId, FREEFORM_SUB_TITLE, 'Hidden template for freeform interviews']
      )

      subUncertaintyId = createdSubRes.rows[0].id
    }

    // --------------------------------------------------
    // 3. Create/reuse goal
    // --------------------------------------------------

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
        INSERT INTO goals (
          sub_uncertainty_id,
          statement
        )
        VALUES ($1, $2)
        RETURNING id
        `,
        [subUncertaintyId, FREEFORM_GOAL_STATEMENT]
      )

      goalId = createdGoalRes.rows[0].id
    }

    // --------------------------------------------------
    // 4. Create/reuse placeholder condition
    // --------------------------------------------------

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
        INSERT INTO conditions (
          goal_id,
          description,
          evidence_required,
          order_index
        )
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

    // --------------------------------------------------
    // 5. Validate optional template
    // --------------------------------------------------

    let templateIdToUse = null
    let templateVersionToUse = null

    if (template_id) {
      const { userId } = getIdentity(event)

      if (!userId) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Login required'
        })
      }

      const templateRes = await client.query(
        `
        SELECT id, version
        FROM interview_templates
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
        `,
        [template_id, userId]
      )

      if (!templateRes.rows.length) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Template not found'
        })
      }

      templateIdToUse = templateRes.rows[0].id
      templateVersionToUse = templateRes.rows[0].version
    }

    // --------------------------------------------------
    // 6. Create interview
    // --------------------------------------------------

    const interviewRes = await client.query(
      `
      INSERT INTO interviews (
        quiz_id,
        sub_uncertainty_id,
        template_id,
        template_version,
        status
      )
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING id
      `,
      [quiz_id, subUncertaintyId, templateIdToUse, templateVersionToUse]
    )

    const interviewId = interviewRes.rows[0].id

    // --------------------------------------------------
    // 7. Snapshot template questions
    // --------------------------------------------------

    if (templateIdToUse) {
      const templateQuestionsRes = await client.query(
        `
        SELECT
          id,
          text,
          question_type,
          options_json,
          order_index
        FROM interview_questions
        WHERE template_id = $1
        ORDER BY order_index ASC
        `,
        [templateIdToUse]
      )

      for (const question of templateQuestionsRes.rows) {
        await client.query(
          `
          INSERT INTO interview_question_snapshots (
            interview_id,
            original_question_id,
            text,
            question_type,
            options_json,
            order_index
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            interviewId,
            question.id,
            question.text,
            question.question_type,
            question.options_json,
            question.order_index
          ]
        )
      }
    }

    // --------------------------------------------------
    // 8. Create runtime condition state
    // --------------------------------------------------

    await client.query(
      `
      INSERT INTO condition_results (
        interview_id,
        condition_id,
        status
      )
      VALUES ($1, $2, 'pending')
      `,
      [interviewId, conditionId]
    )

    // --------------------------------------------------
    // 9. Record usage
    // --------------------------------------------------

    const userId = event.context?.user?.id || event.context?.auth?.userId || null

    if (userId) {
      await recordUsageEvent({
        userId,
        feature: FEATURES.FREEFORM_INTERVIEWS,
        referenceId: interviewId,
        idempotencyKey: idempotency_key || null,
        quantity: 1,
        metadata: {
          quiz_id,
          source: 'interview.freeform.start'
        },
        client
      })
    }

    await client.query('COMMIT')

    return {
      interview_id: interviewId,
      condition_id: conditionId
    }
  } catch (err) {
    await client.query('ROLLBACK')

    console.error('START INTERVIEW ERROR:', err)

    throw err
  } finally {
    client.release()
  }
})
