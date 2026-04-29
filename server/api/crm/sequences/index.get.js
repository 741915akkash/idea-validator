import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const result = await pool.query(
    `
    SELECT
      sequences.id,
      sequences.title,
      sequences.created_at,
      sequences.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', sequence_steps.id,
            'step_number', sequence_steps.step_number,
            'offset', sequence_steps.offset_days,
            'type', sequence_steps.type,
            'title', sequence_steps.title,
            'description', sequence_steps.description
          )
          ORDER BY sequence_steps.step_number
        ) FILTER (WHERE sequence_steps.id IS NOT NULL),
        '[]'::json
      ) AS steps
    FROM sequences
    LEFT JOIN sequence_steps
      ON sequence_steps.sequence_id = sequences.id
    WHERE sequences.user_id = $1
    GROUP BY sequences.id
    ORDER BY sequences.updated_at DESC, sequences.id DESC
    `,
    [userId]
  )

  return result.rows
})
