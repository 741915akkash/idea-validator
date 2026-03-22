import { pool } from '../db'
import { clearSessionCookie, SESSION_TTL_DAYS } from '../utils/auth'

const SLIDING_RENEW_THRESHOLD_DAYS = 15

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')

  if (!sessionId) {
    event.context.user = null
    event.context.auth = null
    return
  }

  const sessionRes = await pool.query(
    `
    SELECT u.id, u.email, u.is_guest, s.id AS session_id, s.expires_at AS session_expires_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = $1
      AND s.expires_at > now()
    LIMIT 1
    `,
    [sessionId]
  )

  if (!sessionRes.rows.length) {
    clearSessionCookie(event)
    event.context.user = null
    event.context.auth = null
    return
  }

  const row = sessionRes.rows[0]
  const sessionExpiresAt = new Date(row.session_expires_at).getTime()
  const renewBeforeMs =
    Date.now() + SLIDING_RENEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000

  if (Number.isFinite(sessionExpiresAt) && sessionExpiresAt <= renewBeforeMs) {
    const nextExpiresAt = new Date(
      Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
    )

    await pool.query(
      `
      UPDATE sessions
      SET expires_at = $2
      WHERE id = $1
      `,
      [row.session_id, nextExpiresAt]
    )
  }

  event.context.user = { id: row.id, email: row.email, is_guest: row.is_guest }
  event.context.auth = { userId: row.id, sessionId: row.session_id }
})
