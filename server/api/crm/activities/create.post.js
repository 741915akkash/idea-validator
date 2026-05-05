import { pool } from '../../../db/index.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = await pool.query(
    `
    INSERT INTO lead_activities (lead_id, type, text, interview_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [body.leadId, body.type, body.text, body.interviewId || null]
  )

  return result.rows[0]
})
