import { pool } from '../../db'
import { readBody } from 'h3' 

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { interview_id, respondent_info } = body

  await pool.query(
    `
    UPDATE interviews
    SET respondent_info = $1
    WHERE id = $2
    `,
    [respondent_info, interview_id]
  )

  return { success: true }
})
