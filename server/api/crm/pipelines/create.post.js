import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'
import {
  getEventEntitlementsFromDb,
  getUsageSnapshot,
  observeCountLimit
} from '../../../utils/track-usage.js'
import { FEATURES } from '../../../utils/features.js'

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const body = await readBody(event)

  const name = String(body?.name || '').trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pipeline name is required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { tier, limits } = await getEventEntitlementsFromDb({
      event,
      client
    })

    const usage = await getUsageSnapshot(client, event)

    const pipelineLimitCheck = observeCountLimit(event, {
      mode: 'observe',
      checkpoint: 'crm.pipeline.create',
      key: FEATURES.PIPELINES,
      tier,
      used: usage.pipelines,
      limit: limits[FEATURES.PIPELINES],
      increment: 1
    })

    if (pipelineLimitCheck.wouldBlock) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Pipeline limit reached for your current plan'
      })
    }

    const result = await client.query(
      `
      INSERT INTO pipelines (
        user_id,
        name
      )
      VALUES ($1, $2)
      RETURNING *
      `,
      [userId, name]
    )

    await client.query('COMMIT')

    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
