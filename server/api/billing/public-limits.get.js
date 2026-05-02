import { eventHandler } from 'h3'
import { pool } from '../../db'
import { getPlanLimitsRows } from '../../db/queries/plans.js'

const TIERS = ['free', 'growth', 'founder']

function toMap(rows) {
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

export default eventHandler(async () => {
  try {
    // run in parallel safely using pool (NOT a single client)
    const results = await Promise.all(TIERS.map((tier) => getPlanLimitsRows({ pool, tier })))

    const [freeRows, growthRows, founderRows] = results

    return {
      tiers: {
        free: toMap(freeRows),
        growth: toMap(growthRows),
        founder: toMap(founderRows)
      }
    }
  } catch (error) {
    console.error('Error fetching plan limits:', error)

    return {
      tiers: {
        free: {},
        growth: {},
        founder: {}
      }
    }
  }
})
