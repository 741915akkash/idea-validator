import { pool } from '../../../../db/index.js'
import { requireCrmEnabled } from '../../../../utils/crm/crmAccess.js'

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const body = await readBody(event)

  const stageId = Number(body?.id)
  const name = String(body?.name || '').trim()
  const color = typeof body?.color === 'string' ? body.color.trim() : ''

  if (!Number.isInteger(stageId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid stage id'
    })
  }

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Stage name is required'
    })
  }

  if (color && !HEX_COLOR_REGEX.test(color)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid color'
    })
  }

  let result

  try {
    result = await pool.query(
      `
      UPDATE pipeline_stages s
      SET
        name = $1,
        color = $2
      FROM pipelines p
      WHERE s.id = $3
        AND s.pipeline_id = p.id
        AND p.user_id = $4
      RETURNING s.*
      `,
      [name, color || null, stageId, userId]
    )
  } catch (error) {
    if (error?.code === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Stage name already exists'
      })
    }

    if (error?.code !== '42703') {
      throw error
    }

    try {
      result = await pool.query(
        `
        UPDATE pipeline_stages s
        SET name = $1
        FROM pipelines p
        WHERE s.id = $2
          AND s.pipeline_id = p.id
          AND p.user_id = $3
        RETURNING s.*
        `,
        [name, stageId, userId]
      )
    } catch (fallbackError) {
      if (fallbackError?.code === '23505') {
        throw createError({
          statusCode: 409,
          statusMessage: 'Stage name already exists'
        })
      }

      throw fallbackError
    }

    if (result.rows[0]) {
      result.rows[0].color = color || null
    }
  }

  if (!result.rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Stage not found'
    })
  }

  return result.rows[0]
})
