import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'
import {
  getEventEntitlementsFromDb,
  getUsageSnapshot,
  observeCountLimit
} from '../../../utils/track-usage.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)
  const position = Number(body.position)

  if (!body?.name || !Number.isInteger(position)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid name or position' })
  }

  const { tier, limits } = await getEventEntitlementsFromDb({ event, client: pool })
  const usage = await getUsageSnapshot(pool, event)
  const pipelinesLimitCheck = observeCountLimit(event, {
    mode: 'enforce',
    checkpoint: 'crm.pipeline.create',
    key: 'pipelines',
    tier,
    used: usage.pipelines ?? 0,
    limit: limits.pipelines,
    increment: 1
  })

  if (pipelinesLimitCheck.wouldBlock) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Pipelines limit reached for your current plan'
    })
  }

  const result = await pool.query(
    `
    INSERT INTO pipeline_stages (name, position, user_id)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [body.name, position, userId]
  )

  return result.rows[0]
})
