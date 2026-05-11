import { pool } from '../../../../db/index.js'
import { requireCrmEnabled } from '../../../../utils/crm/crmAccess.js'
import { requireQuizAccess } from '../../../../utils/quizAccess.js'

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

        next_follow_up_at = CASE
          WHEN $1 IS NULL THEN NULL
          ELSE NOW() + (
            (
              COALESCE(
                (SELECT offset_days FROM first_sequence_step),
                0
              )
            )::text || ' days'
          )::interval
        END,

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
    [sequenceId, leadId, userId, userId, quizId]
  )

  if (!result.rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Lead or sequence not found'
    })
  }

  return result.rows[0]
})
