import { pool } from '../../db'
import { readBody } from 'h3' 
import { requireInterviewAccess } from '../../utils/interviewAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { interview_id, respondent_info } = body

  const client = await pool.connect()
  try {
    await requireInterviewAccess(client, event, interview_id)

    await client.query(
      `
      UPDATE interviews
      SET respondent_info = $1
      WHERE id = $2
      `,
      [respondent_info, interview_id]
    )
  } finally {
    client.release()
  }

  return { success: true }
})
