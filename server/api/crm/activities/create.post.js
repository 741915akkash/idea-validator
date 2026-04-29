import { pool } from '../../../db/index.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = await pool.query(
    `
    INSERT INTO lead_activities (lead_id, type, text)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [body.leadId, body.type, body.text]
  )

  return result.rows[0]
})
