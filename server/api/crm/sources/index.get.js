import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const result = await pool.query(
    `
    SELECT id, name, user_id, created_at
    FROM sources
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  )

  return result.rows
})
