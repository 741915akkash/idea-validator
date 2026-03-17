import { createError } from 'h3'
import { pool } from '../../../db'

function isAuthorized(event) {
  const secret = String(process.env.AUTH_CLEANUP_CRON_SECRET || '')
  if (!secret) return false

  const headerSecret = String(getHeader(event, 'x-cron-secret') || '')
  const authHeader = String(getHeader(event, 'authorization') || '')
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  return headerSecret === secret || bearer === secret
}

export default defineEventHandler(async (event) => {
  if (!isAuthorized(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const expiredCodesRes = await pool.query(
    `
    DELETE FROM login_codes
    WHERE expires_at <= now()
    `
  )

  const expiredSessionsRes = await pool.query(
    `
    DELETE FROM sessions
    WHERE expires_at <= now()
    `
  )

  const deleted = {
    login_codes: expiredCodesRes.rowCount || 0,
    sessions: expiredSessionsRes.rowCount || 0
  }

  console.info('[auth][cleanup]', JSON.stringify(deleted))

  return {
    success: true,
    deleted
  }
})
