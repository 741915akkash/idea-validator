import { pool } from '../../db'
import { clearSessionCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id')

  if (sessionId) {
    await pool.query(
      `
      DELETE FROM sessions
      WHERE id = $1
      `,
      [sessionId]
    )
  }

  clearSessionCookie(event)
  event.context.user = null
  event.context.auth = null

  return { success: true }
})
