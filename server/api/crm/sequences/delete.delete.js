import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'
import { requireQuizAccess } from '../../../utils/quizAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)
  const id = Number(body?.id)
  const quizId = typeof body?.quiz_id === 'string' ? body.quiz_id.trim() : ''

  if (!Number.isInteger(id) || !quizId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sequence id or quiz_id' })
  }

  await requireQuizAccess(pool, event, quizId)

  await pool.query(
    `
    DELETE FROM sequences
    WHERE id = $1
      AND user_id = $2
      AND quiz_id = $3
    `,
    [id, userId, quizId]
  )

  return { success: true }
})
