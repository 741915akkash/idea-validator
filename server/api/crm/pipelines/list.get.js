import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  let result = await pool.query(
    `
  SELECT
    p.id,
    p.name,
    p.created_at,

    (
      SELECT COUNT(*)
      FROM leads l
      WHERE l.pipeline_id = p.id
    ) AS lead_count,

    (
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'position', s.position,
            'color', s.color
          )
          ORDER BY s.position
        ),
        '[]'
      )
      FROM pipeline_stages s
      WHERE s.pipeline_id = p.id
    ) AS stages

  FROM pipelines p
  WHERE p.user_id = $1
  ORDER BY p.created_at ASC
  `,
    [userId]
  )

  return result.rows
})
