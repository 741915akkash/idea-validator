import crypto from 'crypto'
import { pool } from '../db'
import { setCookie, deleteCookie } from 'h3'

export const OTP_TTL_MIN = 10
export const MAX_ATTEMPTS = 5
export const SESSION_TTL_DAYS = 30
export const MAX_ACTIVE_SESSIONS = 5

export function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function generateOTP() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

export function hashOTP(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex')
}

export async function createSession(userId, metadata = {}) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  const ip = metadata?.ip || null
  const userAgent = metadata?.userAgent || null

  const { rows } = await pool.query(
    `
    INSERT INTO sessions (user_id, expires_at, ip, user_agent)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, expires_at, created_at
    `,
    [userId, expiresAt, ip, userAgent]
  )

  return rows[0]
}

export function setSessionCookie(event, sessionId) {
  setCookie(event, 'session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60
  })
}

export function clearSessionCookie(event) {
  deleteCookie(event, 'session_id', { path: '/' })
}
