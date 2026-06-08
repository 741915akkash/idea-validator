import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const result = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.created_at,

      COALESCE(
        COUNT(DISTINCT l.id),
        0
      ) AS lead_count,

      COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'position', s.position,
            'color', s.color
          )
          ORDER BY s.position
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS stages

    FROM pipelines p

    LEFT JOIN pipeline_stages s
      ON s.pipeline_id = p.id

    LEFT JOIN leads l
      ON l.pipeline_id = p.id

    WHERE p.user_id = $1

    GROUP BY p.id

    ORDER BY p.created_at ASC
    `,
    [userId]
  )

  return result.rows
})
