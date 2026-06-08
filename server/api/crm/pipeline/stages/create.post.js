import { pool } from '../../../../db/index.js'
import { requireCrmEnabled } from '../../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const body = await readBody(event)

  const pipelineId = Number(body?.pipeline_id)
  const position = Number(body?.position)
  const name = String(body?.name || '').trim()

  if (!Number.isInteger(pipelineId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid pipeline id'
    })
  }

  if (!Number.isInteger(position)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid position'
    })
  }

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Stage name is required'
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

  const result = await pool.query(
    `
    INSERT INTO pipeline_stages (
      pipeline_id,
      name,
      position,
      user_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [pipelineId, name, position, userId]
  )

  return result.rows[0]
})
