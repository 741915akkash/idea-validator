import { pool } from '../db'
import { clearSessionCookie } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')

  if (!sessionId) {
    event.context.user = null
    event.context.auth = null
    return
  }

  const sessionRes = await pool.query(
    `
    SELECT u.id, u.email, u.is_guest, s.id AS session_id
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
  event.context.user = { id: row.id, email: row.email, is_guest: row.is_guest }
  event.context.auth = { userId: row.id, sessionId: row.session_id }
})
