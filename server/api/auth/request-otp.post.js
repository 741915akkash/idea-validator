import { createError, getRequestIP } from 'h3'
import { pool } from '../../db'
import { generateOTP, hashOTP, isValidEmail, normalizeEmail, OTP_TTL_MIN } from '../../utils/auth'
import { sendOtpEmail } from '../../services/email/sendOtpEmail'
import { logAuthEvent } from '../../utils/authAudit'

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000
const rateLimitBuckets = new Map()

function checkRateLimit(email, ip) {
  const now = Date.now()
  const key = `${email}|${ip || 'unknown'}`
  const bucket = rateLimitBuckets.get(key) || []
  const fresh = bucket.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS)

  if (fresh.length >= RATE_LIMIT_MAX) {
    rateLimitBuckets.set(key, fresh)
    return false
  }

  fresh.push(now)
  rateLimitBuckets.set(key, fresh)
  return true
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = normalizeEmail(body?.email)

  if (!isValidEmail(email)) {
    logAuthEvent(event, 'request_otp_invalid_email', { email })
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid email is required'
    })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const allowed = checkRateLimit(email, ip)

  if (!allowed) {
    logAuthEvent(event, 'request_otp_rate_limited', { email })
    return { success: true }
  }

  const otp = generateOTP()
  const codeHash = hashOTP(otp)
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000)

  await pool.query(
    `
    DELETE FROM login_codes
    WHERE email = $1
      AND expires_at > now()
    `,
    [email]
  )

  await pool.query(
    `
    INSERT INTO login_codes (email, code_hash, expires_at, attempts)
    VALUES ($1, $2, $3, 0)
    `,
    [email, codeHash, expiresAt]
  )

  try {
    await sendOtpEmail({ to: email, code: otp, expiresMinutes: OTP_TTL_MIN })
    logAuthEvent(event, 'request_otp_sent', { email })
  } catch (error) {
    console.error('[auth][request-otp] send failed', error)
    logAuthEvent(event, 'request_otp_send_failed', { email, reason: String(error?.message || error) })

    await pool.query(
      `
      DELETE FROM login_codes
      WHERE email = $1
        AND code_hash = $2
      `,
      [email, codeHash]
    )
  }

  return { success: true }
})
