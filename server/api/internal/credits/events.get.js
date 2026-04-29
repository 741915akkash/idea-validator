import { createError, getHeader, getQuery } from 'h3'
import { pool } from '../../../db'
import { getRecentCreditEventsAdmin } from '../../../db/queries/credits.js'

function isAuthorized(event) {
  const secret = String(process.env.CREDITS_ADMIN_SECRET || '')
  if (!secret) return false

  const headerSecret = String(getHeader(event, 'x-admin-secret') || '')
  const authHeader = String(getHeader(event, 'authorization') || '')
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  return headerSecret === secret || bearer === secret
}

export default defineEventHandler(async (event) => {
  if (!isAuthorized(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const limit = query.limit == null ? 100 : Number(query.limit)
  const userId = query.user_id ? String(query.user_id) : null

  const client = await pool.connect()

  try {
    const events = await getRecentCreditEventsAdmin({
      client,
      limit,
      userId
    })

    return {
      success: true,
      events
    }
  } finally {
    client.release()
  }
})
