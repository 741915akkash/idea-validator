import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'
import { requireQuizAccess } from '../../../utils/quizAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const { quiz_id: quizIdRaw } = getQuery(event)
  const quizId = typeof quizIdRaw === 'string' ? quizIdRaw.trim() : ''

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  await requireQuizAccess(pool, event, quizId)

  const result = await pool.query(
    `
    SELECT id, name, user_id, quiz_id, created_at
    FROM sources
    WHERE user_id = $1
      AND quiz_id = $2
    ORDER BY created_at DESC
    `,
    [userId, quizId]
  )

  return result.rows
})
