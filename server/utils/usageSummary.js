import { FEATURE_KEYS } from './features.js'
import { normalizePlanTier } from './track-usage.js'
import { getPlanLimitsMap } from '../db/queries/plans.js'
import { getUsageGrouped } from '../db/queries/usage.js'

export function getUtcMonthlyWindow(now = new Date()) {
  const current = now instanceof Date ? now : new Date(now)
  const year = current.getUTCFullYear()
  const month = current.getUTCMonth()

  const windowStart = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const windowEnd = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0))

  return { windowStart, windowEnd }
}

export async function getUsageSummary({ user, client, now = new Date() }) {
  const tier = normalizePlanTier(user?.plan_tier)
  const userId = user?.id || null
  const { windowStart, windowEnd } = getUtcMonthlyWindow(now)

  const [limitsByFeature, usageRows] = await Promise.all([
    getPlanLimitsMap({ client, tier }),
    userId ? getUsageGrouped({ client, userId, windowStart }) : Promise.resolve([])
  ])

  const usageByFeature = Object.fromEntries(
    usageRows.map((row) => [row.feature, Number(row.total || 0)])
  )

  const usage = {}
  for (const feature of FEATURE_KEYS) {
    const limitInfo = limitsByFeature[feature] || {
      enabled: true,
      limit: null,
      period: 'monthly'
    }

    const used = usageByFeature[feature] || 0
    const limit = limitInfo.limit
    const remaining = limit == null ? null : Math.max(limit - used, 0)

    usage[feature] = {
      used,
      limit,
      remaining,
      enabled: Boolean(limitInfo.enabled),
      tier,
      period: limitInfo.period || 'monthly',
      window_start: windowStart.toISOString(),
      window_end: windowEnd.toISOString(),
      resets_at: windowEnd.toISOString()
    }
  }

  return usage
}
