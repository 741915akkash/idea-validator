import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)
  const id = Number(body?.id)

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sequence id' })
  }

  await pool.query(
    `
    DELETE FROM sequences
    WHERE id = $1
      AND user_id = $2
    `,
    [id, userId]
  )

  return { success: true }
})
