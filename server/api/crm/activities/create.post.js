import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'
import { requireQuizAccess } from '../../../utils/quizAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)
  const quizId = typeof body?.quiz_id === 'string' ? body.quiz_id.trim() : ''

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  await requireQuizAccess(pool, event, quizId)

  const result = await pool.query(
    `
    WITH selected_lead AS (
      SELECT id
      FROM leads
      WHERE id = $1
        AND user_id = $5
        AND quiz_id = $6
      LIMIT 1
    )
    INSERT INTO lead_activities (lead_id, type, text, interview_id, quiz_id)
    SELECT id, $2, $3, $4, $6
    FROM selected_lead
    RETURNING *
    `,
    [body.leadId, body.type, body.text, body.interviewId || null, userId, quizId]
  )

  if (!result.rows.length) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lead for selected quiz' })
  }

  return result.rows[0]
})
