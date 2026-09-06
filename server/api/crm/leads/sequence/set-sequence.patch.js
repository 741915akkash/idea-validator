import { pool } from '../../../../db/index.js'
import { requireCrmEnabled } from '../../../../utils/crm/crmAccess.js'
import { requireQuizAccess } from '../../../../utils/quizAccess.js'
import { addBusinessDays, isBusinessDay } from '../../../../utils/business-days.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const body = await readBody(event)

  const leadId = Number(body.lead_id)
  const quizId = typeof body.quiz_id === 'string' ? body.quiz_id.trim() : ''

  const sequenceId =
    body.sequence_id === null || body.sequence_id === undefined || body.sequence_id === ''
      ? null
      : Number(body.sequence_id)

  if (!Number.isInteger(leadId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid lead_id'
    })
  }

  if (!quizId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id required'
    })
  }

  if (sequenceId !== null && !Number.isInteger(sequenceId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sequence_id'
    })
  }

  await requireQuizAccess(pool, event, quizId)

  const sequenceResult =
    sequenceId === null
      ? { rows: [] }
      : await pool.query(
          `
        SELECT
          id,
          business_days_only
        FROM sequences
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
        `,
          [sequenceId, userId]
        )

  if (sequenceId !== null && !sequenceResult.rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Lead or sequence not found'
    })
  }

  let firstStep = null
  let businessDaysOnly = false

  if (sequenceId !== null) {
    businessDaysOnly = Boolean(sequenceResult.rows[0].business_days_only)

    const firstStepResult = await pool.query(
      `
      SELECT step_number, offset_days
      FROM sequence_steps
      WHERE sequence_id = $1
      ORDER BY step_number ASC
      LIMIT 1
      `,
      [sequenceId]
    )

    firstStep = firstStepResult.rows[0] || null
  }

  let nextFollowUpAt = null

  if (sequenceId !== null) {
    const offsetDays = Number(firstStep?.offset_days ?? 0)
    const now = new Date()

    if (businessDaysOnly) {
      let baseDate = new Date(now)

      // Step 1 must never be scheduled on Saturday or Sunday.
      if (!isBusinessDay(baseDate)) {
        while (!isBusinessDay(baseDate)) {
          baseDate.setUTCDate(baseDate.getUTCDate() + 1)
        }
      }

      nextFollowUpAt = addBusinessDays(baseDate, offsetDays).toISOString()
    } else {
      const followUpDate = new Date(now)
      followUpDate.setUTCDate(followUpDate.getUTCDate() + offsetDays)

      nextFollowUpAt = followUpDate.toISOString()
    }
  }

  const result = await pool.query(
    `
    WITH selected_sequence AS (
      SELECT id
      FROM sequences
      WHERE id = $1
        AND user_id = $4
      LIMIT 1
    ),

    first_sequence_step AS (
      SELECT step_number, offset_days
      FROM sequence_steps
      WHERE sequence_id = (SELECT id FROM selected_sequence)
      ORDER BY step_number ASC
      LIMIT 1
    ),

    updated AS (
      UPDATE leads
      SET
        sequence_id = CASE
          WHEN $1 IS NULL THEN NULL
          ELSE (SELECT id FROM selected_sequence)
        END,

        current_step = CASE
          WHEN $1 IS NULL THEN NULL
          ELSE COALESCE(
            (SELECT step_number FROM first_sequence_step),
            1
          )
        END,

        next_follow_up_at = $6,

        updated_at = NOW()

      WHERE id = $2
        AND user_id = $3
        AND quiz_id = $5
        AND (
          $1 IS NULL
          OR EXISTS (SELECT 1 FROM selected_sequence)
        )

      RETURNING *
    )

    SELECT
      updated.*,
      pipeline_stages.name AS stage,
      users.name AS owner_name,
      users.email AS owner_email,
      sources.name AS source_name,
      sequences.title AS sequence_name,

      CASE
        WHEN updated.sequence_id IS NULL THEN NULL
        ELSE json_build_object(
          'id', updated.sequence_id,
          'name', sequences.title,
          'current_step', updated.current_step,

          'total_steps', (
            SELECT COUNT(*)::int
            FROM sequence_steps ss_total
            WHERE ss_total.sequence_id = updated.sequence_id
          ),

          'current_step_type', (
            SELECT ss_current.type
            FROM sequence_steps ss_current
            WHERE ss_current.sequence_id = updated.sequence_id
              AND ss_current.step_number = updated.current_step
            LIMIT 1
          ),

          'next_follow_up_at', updated.next_follow_up_at
        )
      END AS sequence

    FROM updated

    LEFT JOIN pipeline_stages
      ON updated.stage_id = pipeline_stages.id

    LEFT JOIN users
      ON updated.user_id = users.id

    LEFT JOIN sources
      ON updated.source_id = sources.id

    LEFT JOIN sequences
      ON updated.sequence_id = sequences.id
    `,
    [sequenceId, leadId, userId, userId, quizId, nextFollowUpAt]
  )

  if (!result.rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Lead or sequence not found'
    })
  }

  return result.rows[0]
})
