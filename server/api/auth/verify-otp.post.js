import { createError } from 'h3'
import { pool } from '../../db'
import {
  MAX_ATTEMPTS,
  hashOTP,
  isValidEmail,
  normalizeEmail,
  setSessionCookie
} from '../../utils/auth'
import { logAuthEvent } from '../../utils/authAudit'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = normalizeEmail(body?.email)
  const code = String(body?.code || '').trim()
  const signupSource = String(body?.signup_source || '')
    .trim()
    .toLowerCase()
  const quizId = body?.quiz_id || null
  const visitorId = event.context?.visitorId || null

  if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
    logAuthEvent(event, 'verify_otp_invalid_payload', { email })
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid email and 6-digit code are required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const codeRes = await client.query(
      `
      SELECT id, code_hash, expires_at, attempts
      FROM login_codes
      WHERE email = $1
        AND expires_at > now()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [email]
    )

    const record = codeRes.rows[0]

    if (!record || new Date(record.expires_at).getTime() <= Date.now()) {
      logAuthEvent(event, 'verify_otp_missing_or_expired', { email })
      throw createError({
        statusCode: 400,
        statusMessage: 'Code expired or not found'
      })
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      logAuthEvent(event, 'verify_otp_blocked_attempt_limit', { email, attempts: record.attempts })
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many attempts. Request a new code.'
      })
    }

    const isMatch = hashOTP(code) === record.code_hash

    if (!isMatch) {
      const nextAttempts = Number(record.attempts || 0) + 1

      await client.query(
        `
        UPDATE login_codes
        SET attempts = $2
        WHERE id = $1
        `,
        [record.id, nextAttempts]
      )

      logAuthEvent(event, 'verify_otp_invalid_code', {
        email,
        attempts: nextAttempts
      })

      throw createError({
        statusCode: nextAttempts >= MAX_ATTEMPTS ? 429 : 400,
        statusMessage:
          nextAttempts >= MAX_ATTEMPTS
            ? 'Too many attempts. Request a new code.'
            : 'Invalid code'
      })
    }

    const existing = await client.query(
      `
      SELECT id, email, is_guest
      FROM users
      WHERE lower(email) = $1
      LIMIT 1
      `,
      [email]
    )

    let user

    if (existing.rows.length) {
      user = existing.rows[0]

      if (user.is_guest) {
        const upgraded = await client.query(
          `
          UPDATE users
          SET is_guest = false
          WHERE id = $1
          RETURNING id, email, is_guest
          `,
          [user.id]
        )
        user = upgraded.rows[0]
      }
    } else {
      const created = await client.query(
        `
        INSERT INTO users (email, is_guest)
        VALUES ($1, false)
        RETURNING id, email, is_guest
        `,
        [email]
      )
      user = created.rows[0]
    }

    let transferredQuizId = null
    const shouldTransferScoreWallQuiz =
      signupSource === 'score_wall' && Boolean(quizId) && Boolean(visitorId)

    if (shouldTransferScoreWallQuiz) {
      const transferRes = await client.query(
        `
        UPDATE quizzes
        SET user_id = $1,
            visitor_id = NULL
        WHERE id = $2
          AND visitor_id = $3
          AND status = 'COMPLETED'
          AND user_id IS NULL
        RETURNING id
        `,
        [user.id, quizId, visitorId]
      )

      transferredQuizId = transferRes.rows[0]?.id || null

      if (transferredQuizId) {
        await client.query(
          `
          UPDATE users
          SET current_quiz_id = $1
          WHERE id = $2
          `,
          [transferredQuizId, user.id]
        )
      }
    }

    const sessionRes = await client.query(
      `
      INSERT INTO sessions (user_id, expires_at)
      VALUES ($1, now() + interval '30 days')
      RETURNING id, user_id, expires_at, created_at
      `,
      [user.id]
    )

    await client.query(
      `
      DELETE FROM login_codes
      WHERE id = $1
      `,
      [record.id]
    )

    await client.query('COMMIT')

    const session = sessionRes.rows[0]
    setSessionCookie(event, session.id)
    event.context.user = user
    event.context.auth = { userId: user.id, sessionId: session.id }
    logAuthEvent(event, 'verify_otp_success', { email, userId: user.id })

    return {
      success: true,
      user,
      transfer: {
        attempted: shouldTransferScoreWallQuiz,
        transferred: Boolean(transferredQuizId),
        quiz_id: transferredQuizId
      }
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
