import { pool } from '../../../db/index.js'

export default defineEventHandler(async (event) => {
  const { leadId } = getQuery(event)

  const result = await pool.query(
    `
    SELECT * FROM lead_activities
    WHERE lead_id = $1
    ORDER BY created_at DESC
    `,
    [leadId]
  )

  return result.rows
})
