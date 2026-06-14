import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)

  const id = Number(body?.id)
  const name = String(body?.name || '').trim()

  if (!Number.isInteger(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid pipeline id'
    })
  }

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pipeline name required'
    })
  }

  const result = await pool.query(
    `
    UPDATE pipelines
    SET name = $1
    WHERE id = $2
      AND user_id = $3
    RETURNING *
    `,
    [name, id, userId]
  )

  if (!result.rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Pipeline not found'
    })
  }

  return result.rows[0]
})
