import { createError } from 'h3'
import { pool } from '../../db'
import { isCrmEnabled } from '~/utils/feature-flags.js'

async function resolveUser(event) {
  if (event.context?.user?.id) {
    return event.context.user
  }

  const authUserId = event.context?.auth?.userId || null
  if (!authUserId) {
    return null
  }

  let result
  try {
    result = await pool.query(
      `
      SELECT
        id,
        email,
        is_guest,
        COALESCE(crm_enabled, false) AS crm_enabled,
        COALESCE(plan_tier, 'free') AS plan_tier,
        plan_status,
        plan_expires_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [authUserId]
    )
  } catch (error) {
    if (error?.code !== '42703') {
      throw error
    }

    result = await pool.query(
      `
      SELECT id, email, is_guest
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [authUserId]
    )
  }

  if (!result.rows.length) {
    return null
  }

  const row = result.rows[0]
  const user = {
    id: row.id,
    email: row.email,
    is_guest: row.is_guest,
    crm_enabled: Boolean(row.crm_enabled),
    plan_tier: row.plan_tier || 'free',
    plan_status: row.plan_status || null,
    plan_expires_at: row.plan_expires_at || null
  }

  event.context.user = user
  return user
}

export async function requireCrmEnabled(event) {
  const user = await resolveUser(event)
  const config = useRuntimeConfig()

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Login required'
    })
  }

  if (!isCrmEnabled(user, config)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'CRM access is not enabled for this account'
    })
  }

  return { userId: user.id }
}
