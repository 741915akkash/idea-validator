import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'
import { requireQuizAccess } from '../../../utils/quizAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const { leadId, quiz_id: quizIdRaw } = getQuery(event)
  const quizId = typeof quizIdRaw === 'string' ? quizIdRaw.trim() : ''

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  await requireQuizAccess(pool, event, quizId)

  const leadCheck = await pool.query(
    `
    SELECT id
    FROM leads
    WHERE id = $1
      AND user_id = $2
      AND quiz_id = $3
    LIMIT 1
    `,
    [leadId, userId, quizId]
  )

  if (!leadCheck.rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  const result = await pool.query(
    `
    SELECT * FROM lead_activities
    WHERE lead_id = $1
      AND quiz_id = $2
    ORDER BY created_at DESC
    `,
    [leadId, quizId]
  )

  return result.rows
})
