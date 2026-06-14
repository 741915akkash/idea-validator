import { pool } from '../../../../db/index.js'
import { requireCrmEnabled } from '../../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const pipelineId = Number(getQuery(event).pipelineId)

  if (!Number.isInteger(pipelineId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid pipeline id'
    })
  }

  const pipelineResult = await pool.query(
    `
    SELECT id
    FROM pipelines
    WHERE id = $1
      AND user_id = $2
    `,
    [pipelineId, userId]
  )

  if (!pipelineResult.rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Pipeline not found'
    })
  }

  const stagesResult = await pool.query(
    `
    SELECT *
    FROM pipeline_stages
    WHERE pipeline_id = $1
    ORDER BY position ASC
    `,
    [pipelineId]
  )

  return stagesResult.rows
})
