import { pool } from '../../../../db/index.js'
import { requireCrmEnabled } from '../../../../utils/crm/crmAccess.js'

const HYDRATED_LEAD_SELECT = `
  SELECT
    leads.*,
    pipeline_stages.name AS stage,
    users.name AS owner_name,
    users.email AS owner_email,
    sources.name AS source_name,
    sequences.title AS sequence_name,
    CASE
      WHEN leads.sequence_id IS NULL THEN NULL
      ELSE json_build_object(
        'id', leads.sequence_id,
        'name', sequences.title,
        'current_step', leads.current_step,
        'total_steps', (
          SELECT COUNT(*)::int
          FROM sequence_steps ss_total
          WHERE ss_total.sequence_id = leads.sequence_id
        ),
        'current_step_type', (
          SELECT ss_current.type
          FROM sequence_steps ss_current
          WHERE ss_current.sequence_id = leads.sequence_id
            AND ss_current.step_number = leads.current_step
          LIMIT 1
        ),
        'next_follow_up_at', leads.next_follow_up_at
      )
    END AS sequence
  FROM leads
  LEFT JOIN pipeline_stages
    ON leads.stage_id = pipeline_stages.id
  LEFT JOIN users
    ON leads.user_id = users.id
  LEFT JOIN sources
    ON leads.source_id = sources.id
  LEFT JOIN sequences
    ON leads.sequence_id = sequences.id
  WHERE leads.id = $1
    AND leads.user_id = $2
  LIMIT 1
`

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)
  const leadId = Number(body?.id ?? body?.leadId)

  if (!Number.isInteger(leadId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lead id' })
  }

  if (body?.value === null || body?.value === undefined || body?.value === '') {
    throw createError({ statusCode: 400, statusMessage: 'Follow-up date required' })
  }

  const parsed = new Date(body.value)

  if (Number.isNaN(parsed.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid next_follow_up_at' })
  }

  const updated = await pool.query(
    `
    UPDATE leads
    SET next_follow_up_at = $1,
        updated_at = NOW()
    WHERE id = $2
      AND user_id = $3
    RETURNING id
    `,
    [parsed.toISOString(), leadId, userId]
  )

  if (!updated.rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  const hydrated = await pool.query(HYDRATED_LEAD_SELECT, [leadId, userId])
  return hydrated.rows[0]
})
