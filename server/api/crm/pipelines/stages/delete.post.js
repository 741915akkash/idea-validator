import { pool } from '../../../../db/index.js'
import { requireCrmEnabled } from '../../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const body = await readBody(event)

  const stageId = Number(body?.id)

  if (!Number.isInteger(stageId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid stage id'
    })
  }

  const result = await pool.query(
    `
    DELETE FROM pipeline_stages s
    USING pipelines p
    WHERE s.id = $1
      AND s.pipeline_id = p.id
      AND p.user_id = $2
    RETURNING s.*
    `,
    [stageId, userId]
  )

  if (!result.rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Stage not found'
    })
  }

  return {
    success: true,
    stage: result.rows[0]
  }
})
