import { eventHandler } from 'h3'
import { pool } from '../../db'
import { normalizePlanTier } from '../../utils/track-usage.js'
import { getPlanLimitsRows } from '../../db/queries/plans.js'

export default eventHandler(async (event) => {
  const user = event.context?.user || null

  if (!user) {
    return {
      authenticated: false,
      limits: null
    }
  }

  const tier = normalizePlanTier(user.plan_tier)

  try {
    // use pool instead of client
    const rows = await getPlanLimitsRows({ pool, tier })

    const limits = {}
    for (const row of rows) {
      limits[row.feature] = {
        enabled: Boolean(row.enabled),
        limit: row.limit_value == null ? null : Number(row.limit_value),
        period: row.period,
        tier
      }
    }

    return {
      authenticated: true,
      tier,
      limits
    }
  } catch (error) {
    console.error('Error fetching plan limits:', error)

    return {
      authenticated: true,
      tier,
      limits: {}
    }
  }
})
