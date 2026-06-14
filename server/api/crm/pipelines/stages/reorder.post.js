import { pool } from '../../../../db/index.js'
import { requireCrmEnabled } from '../../../../utils/crm/crmAccess.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const body = await readBody(event)

  if (!Array.isArray(body) || !body.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid payload'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    for (const item of body) {
      const stageId = Number(item?.id)
      const position = Number(item?.position)

      if (!Number.isInteger(stageId)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid stage id'
        })
      }

      if (!Number.isInteger(position)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid position'
        })
      }

      const result = await client.query(
        `
        UPDATE pipeline_stages s
        SET position = $1
        FROM pipelines p
        WHERE s.id = $2
          AND s.pipeline_id = p.id
          AND p.user_id = $3
        RETURNING s.id
        `,
        [position, stageId, userId]
      )

      if (!result.rows.length) {
        throw createError({
          statusCode: 404,
          statusMessage: `Stage ${stageId} not found`
        })
      }
    }

    await client.query('COMMIT')

    return {
      success: true
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
