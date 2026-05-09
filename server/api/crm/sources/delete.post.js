import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)
  const id = typeof body?.id === 'string' ? body.id.trim() : ''

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Source id required' })
  }

  await pool.query(
    `
    DELETE FROM sources
    WHERE id = $1
      AND user_id = $2
    `,
    [id, userId]
  )

  return { success: true }
})
