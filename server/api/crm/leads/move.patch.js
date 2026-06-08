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

  await pool.query(
    `
        WITH selected_stage AS (
      SELECT
        s.id,
        s.pipeline_id
      FROM pipeline_stages s
      JOIN pipelines p
        ON p.id = s.pipeline_id
      WHERE s.id = $1
        AND p.user_id = $4
      LIMIT 1
    )
    UPDATE leads
    SET
      stage_id = (SELECT id FROM selected_stage),
      pipeline_id = (SELECT pipeline_id FROM selected_stage),
      updated_at = NOW()
    WHERE id = $2
      AND user_id = $3
      AND quiz_id = $5
      AND EXISTS (
        SELECT 1
        FROM selected_stage
      )
    `,
    [body.stage_id, body.lead_id, userId, userId, quizId]
  )

  return { success: true }
})
