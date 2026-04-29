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

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const leadResult = await client.query(
      `
      SELECT id, user_id, sequence_id, current_step, next_follow_up_at
      FROM leads
      WHERE id = $1
        AND user_id = $2
      FOR UPDATE
      `,
      [leadId, userId]
    )

    if (!leadResult.rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
    }

    const lead = leadResult.rows[0]
    let nextStepNumber = null
    let nextFollowUpAt = null
    let completedStep = null

    if (lead.sequence_id && lead.current_step) {
      const currentStepResult = await client.query(
        `
        SELECT id, step_number, offset_days, type, title
        FROM sequence_steps
        WHERE sequence_id = $1
          AND step_number = $2
        LIMIT 1
        `,
        [lead.sequence_id, lead.current_step]
      )

      if (currentStepResult.rows.length) {
        completedStep = currentStepResult.rows[0]

        const nextStepResult = await client.query(
          `
          SELECT id, step_number, offset_days, type, title
          FROM sequence_steps
          WHERE sequence_id = $1
            AND step_number = $2
          LIMIT 1
          `,
          [lead.sequence_id, lead.current_step + 1]
        )

        if (nextStepResult.rows.length) {
          const nextStep = nextStepResult.rows[0]
          const offsetDiff = Math.max(
            0,
            Number(nextStep.offset_days) - Number(completedStep.offset_days)
          )
          const baseDate = lead.next_follow_up_at ? new Date(lead.next_follow_up_at) : new Date()
          const shiftedDate = new Date(baseDate)

          shiftedDate.setUTCDate(shiftedDate.getUTCDate() + offsetDiff)

          nextStepNumber = nextStep.step_number
          nextFollowUpAt = shiftedDate.toISOString()
        }
      }
    }

    await client.query(
      `
      UPDATE leads
      SET current_step = $1,
          next_follow_up_at = $2,
          updated_at = NOW()
      WHERE id = $3
        AND user_id = $4
      `,
      [nextStepNumber, nextFollowUpAt, leadId, userId]
    )

    if (completedStep) {
      const safeType = ['call', 'email', 'note'].includes(completedStep.type)
        ? completedStep.type
        : 'note'
      const activityText = completedStep.title
        ? `Completed sequence step ${completedStep.step_number}: ${completedStep.title}`
        : `Completed sequence step ${completedStep.step_number}`

      await client.query(
        `
        INSERT INTO lead_activities (lead_id, type, text, sequence_step_id)
        VALUES ($1, $2, $3, $4)
        `,
        [leadId, safeType, activityText, completedStep.id]
      )
    } else {
      await client.query(
        `
        INSERT INTO lead_activities (lead_id, type, text)
        VALUES ($1, 'note', 'Follow-up marked done')
        `,
        [leadId]
      )
    }

    const hydrated = await client.query(HYDRATED_LEAD_SELECT, [leadId, userId])

    await client.query('COMMIT')
    return hydrated.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
