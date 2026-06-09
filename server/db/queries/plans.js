import { normalizePlanTier } from '../../utils/track-usage.js'

export async function getPlanLimitsRows({ client, tier }) {
  const normalizedTier = normalizePlanTier(tier)

  const { rows } = await client.query(
    `
      SELECT
        plan_tier,
        feature,
        enabled,
        limit_value,
        period
      FROM plan_limits
      WHERE plan_tier = $1
    `,
    [normalizedTier]
  )

  return rows
}

export async function getPlanLimitsMap({ client, tier }) {
  const rows = await getPlanLimitsRows({ client, tier })

  const limits = {}
  for (const row of rows) {
    limits[row.feature] = {
      enabled: Boolean(row.enabled),
      limit: row.limit_value == null ? null : Number(row.limit_value),
      period: row.period
    }
  }

  return limits
}
