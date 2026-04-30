import { FEATURES } from './features.js'
const FREEFORM_NORMALIZED_TEXT = '__freeform_template__'

export const PLAN_LIMITS = {
  free: {
    [FEATURES.ACTIVE_IDEAS]: 2,
    [FEATURES.ARCHIVED_IDEAS]: 3,
    [FEATURES.REVISIONS]: 30,
    [FEATURES.FREEFORM_INTERVIEWS]: 30,
    [FEATURES.STRUCTURED_VALIDATION]: false,
    [FEATURES.CONTACTS]: 100,
    [FEATURES.PIPELINES]: 1
  },
  growth: {
    [FEATURES.ACTIVE_IDEAS]: 5,
    [FEATURES.ARCHIVED_IDEAS]: 50,
    [FEATURES.REVISIONS]: null,
    [FEATURES.FREEFORM_INTERVIEWS]: null,
    [FEATURES.STRUCTURED_VALIDATION]: true,
    [FEATURES.CONTACTS]: 5000,
    [FEATURES.PIPELINES]: null
  },
  founder: {
    [FEATURES.ACTIVE_IDEAS]: 5,
    [FEATURES.ARCHIVED_IDEAS]: 100,
    [FEATURES.REVISIONS]: null,
    [FEATURES.FREEFORM_INTERVIEWS]: null,
    [FEATURES.STRUCTURED_VALIDATION]: true,
    [FEATURES.CONTACTS]: 25000,
    [FEATURES.PIPELINES]: null
  }
}

export function normalizePlanTier(rawTier) {
  const tier = String(rawTier || '')
    .trim()
    .toLowerCase()
  return PLAN_LIMITS[tier] ? tier : 'free'
}

export function getPlanLimits(tier) {
  const normalizedTier = normalizePlanTier(tier)
  return PLAN_LIMITS[normalizedTier]
}

export function getEventEntitlements(event) {
  const rawTier = event?.context?.user?.plan_tier
  const tier = normalizePlanTier(rawTier)
  return {
    tier,
    limits: getPlanLimits(tier)
  }
}

export async function getEventEntitlementsFromDb({ event, client }) {
  const base = getEventEntitlements(event)

  if (!client || typeof client.query !== 'function') {
    return base
  }

  try {
    const { rows } = await client.query(
      `
      SELECT feature, enabled, limit_value
      FROM plan_limits
      WHERE plan_tier = $1
      `,
      [base.tier]
    )

    if (!rows.length) {
      return base
    }

    const byFeature = Object.fromEntries(rows.map((row) => [row.feature, row]))
    const mergedLimits = { ...base.limits }

    for (const [featureKey, fallbackValue] of Object.entries(base.limits)) {
      const dbRow = byFeature[featureKey]
      if (!dbRow) continue

      if (typeof fallbackValue === 'boolean') {
        mergedLimits[featureKey] = Boolean(dbRow.enabled)
        continue
      }

      mergedLimits[featureKey] =
        dbRow.limit_value == null ? null : Number(dbRow.limit_value)
    }

    return {
      tier: base.tier,
      limits: mergedLimits
    }
  } catch (error) {
    console.warn('[plan_limits][db_fallback]', {
      message: error?.message || 'failed to load plan_limits',
      tier: base.tier
    })
    return base
  }
}

export function getPlanLimitMode(options = {}) {
  const requestedMode = options?.mode
  if (requestedMode === 'observe' || requestedMode === 'enforce') {
    return requestedMode
  }

  return process.env.PLAN_LIMITS_ENFORCED === 'true' ? 'enforce' : 'observe'
}

function logWouldBlockEvent(eventName, payload) {
  if (!payload?.wouldBlock) return
  console.warn(eventName, payload)
}

export function observeCountLimit(event, options = {}) {
  const mode = getPlanLimitMode({ mode: options.mode })
  const used = Number(options.used ?? 0)
  const increment = Number(options.increment ?? 1)
  const limit = options.limit == null ? null : Number(options.limit)
  const finiteLimit = Number.isFinite(limit)
  const wouldBlock = finiteLimit ? used + increment > limit : false

  const result = {
    mode,
    type: 'count_limit',
    checkpoint: options.checkpoint || 'unknown',
    key: options.key || 'unknown',
    tier: options.tier || 'free',
    used,
    increment,
    limit,
    wouldBlock,
    user_id: event?.context?.user?.id || null
  }

  if (wouldBlock) {
    logWouldBlockEvent('[plan_limits][would_block]', result)
  }

  return result
}

export function observeFeatureGate(event, options = {}) {
  const mode = getPlanLimitMode({ mode: options.mode })
  const allowed = Boolean(options.allowed)
  const wouldBlock = !allowed

  const result = {
    mode,
    type: 'feature_gate',
    checkpoint: options.checkpoint || 'unknown',
    key: options.key || 'unknown',
    tier: options.tier || 'free',
    allowed,
    wouldBlock,
    user_id: event?.context?.user?.id || null
  }

  if (wouldBlock) {
    logWouldBlockEvent('[plan_limits][would_block]', result)
  }

  return result
}

function toMonthWindow(inputDate = new Date()) {
  const year = inputDate.getUTCFullYear()
  const month = inputDate.getUTCMonth()
  const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const monthEnd = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0))
  return { monthStart, monthEnd }
}

async function countRootIdeas(client, userId, { archived }) {
  const { rows } = await client.query(
    `
    SELECT COUNT(*)::int AS count
    FROM quizzes
    WHERE user_id = $1
      AND parent_quiz_id IS NULL
      AND archived_at IS ${archived ? 'NOT NULL' : 'NULL'}
    `,
    [userId]
  )

  return Number(rows[0]?.count || 0)
}

async function resolveRootQuizId(client, quizId) {
  const { rows } = await client.query(
    `
    SELECT COALESCE(parent_quiz_id, id) AS root_quiz_id
    FROM quizzes
    WHERE id = $1
    LIMIT 1
    `,
    [quizId]
  )

  return rows[0]?.root_quiz_id || null
}

async function countRevisionsForRoot(client, userId, rootQuizId) {
  if (!rootQuizId) return null

  const { rows } = await client.query(
    `
    SELECT GREATEST(COUNT(*)::int - 1, 0) AS count
    FROM quizzes
    WHERE user_id = $1
      AND (id = $2 OR parent_quiz_id = $2)
    `,
    [userId, rootQuizId]
  )

  return Number(rows[0]?.count || 0)
}

async function countContacts(client, userId) {
  const { rows } = await client.query(
    `
    SELECT COUNT(*)::int AS count
    FROM leads
    WHERE user_id = $1
    `,
    [userId]
  )

  return Number(rows[0]?.count || 0)
}

async function countPipelines(client, userId) {
  const { rows } = await client.query(
    `
    SELECT COUNT(*)::int AS count
    FROM pipeline_stages
    WHERE user_id = $1
    `,
    [userId]
  )

  return Number(rows[0]?.count || 0)
}

async function countFreeformInterviewsForRootInMonth(
  client,
  userId,
  rootQuizId,
  { monthStart, monthEnd }
) {
  if (!rootQuizId) return null

  const { rows } = await client.query(
    `
    WITH family AS (
      SELECT id
      FROM quizzes
      WHERE user_id = $1
        AND (id = $2 OR parent_quiz_id = $2)
    )
    SELECT COUNT(i.id)::int AS count
    FROM interviews i
    JOIN family f ON f.id = i.quiz_id
    JOIN sub_uncertainties s ON s.id = i.sub_uncertainty_id
    JOIN uncertainties u ON u.id = s.uncertainty_id
    WHERE u.normalized_text = $3
      AND i.started_at >= $4
      AND i.started_at < $5
    `,
    [userId, rootQuizId, FREEFORM_NORMALIZED_TEXT, monthStart, monthEnd]
  )

  return Number(rows[0]?.count || 0)
}

export async function getUsageSnapshot(client, event, options = {}) {
  const userId = event?.context?.user?.id || null
  const quizId = options.quizId || null
  const now = options.at instanceof Date ? options.at : new Date()
  const { monthStart, monthEnd } = toMonthWindow(now)

  if (!userId) {
    return {
      activeIdeas: 0,
      archivedIdeas: 0,
      contacts: 0,
      pipelines: 0,
      revisionsForIdea: null,
      freeformInterviewsForIdeaThisMonth: null,
      monthStart,
      monthEnd
    }
  }

  const [activeIdeas, archivedIdeas, contacts, pipelines] = await Promise.all([
    countRootIdeas(client, userId, { archived: false }),
    countRootIdeas(client, userId, { archived: true }),
    countContacts(client, userId),
    countPipelines(client, userId)
  ])

  const rootQuizId = quizId ? await resolveRootQuizId(client, quizId) : null

  let revisionsForIdea = null
  let freeformInterviewsForIdeaThisMonth = null

  if (rootQuizId) {
    ;[revisionsForIdea, freeformInterviewsForIdeaThisMonth] = await Promise.all([
      countRevisionsForRoot(client, userId, rootQuizId),
      countFreeformInterviewsForRootInMonth(client, userId, rootQuizId, {
        monthStart,
        monthEnd
      })
    ])
  }

  return {
    activeIdeas,
    archivedIdeas,
    contacts,
    pipelines,
    revisionsForIdea,
    freeformInterviewsForIdeaThisMonth,
    monthStart,
    monthEnd
  }
}
