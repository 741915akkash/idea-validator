import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)

  const pipelineId = Number(body?.id)

  if (!Number.isInteger(pipelineId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid pipeline id'
    })
  }

  const leadCheck = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM leads
    WHERE pipeline_id = $1
    `,
    [pipelineId]
  )

  if (leadCheck.rows[0].count > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pipeline contains leads'
    })
  }

  const result = await pool.query(
    `
    DELETE FROM pipelines
    WHERE id = $1
      AND user_id = $2
    RETURNING *
    `,
    [pipelineId, userId]
  )

  if (!result.rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Pipeline not found'
    })
  }

  return {
    success: true
  }
})
