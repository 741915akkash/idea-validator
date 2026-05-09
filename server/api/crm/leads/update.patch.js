import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'
import { requireQuizAccess } from '../../../utils/quizAccess.js'

const UUID_V4_OR_V1_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/

function normalizePhone(value) {
  const raw = String(value || '').trim()
  if (!raw) return null

  const hasPlusPrefix = raw.startsWith('+')
  const digitsOnly = raw.replace(/\D/g, '')
  if (!digitsOnly) return null

  return hasPlusPrefix ? `+${digitsOnly}` : digitsOnly
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)
  const quizId = typeof body?.quiz_id === 'string' ? body.quiz_id.trim() : ''
  const allowedFields = new Set([
    'name',
    'company',
    'email',
    'phone',
    'stage_id',
    'user_id',
    'source_id',
    'sequence_id',
    'current_step',
    'next_follow_up_at'
  ])

  if (!allowedFields.has(body.field)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid field' })
  }

  if (!quizId) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  await requireQuizAccess(pool, event, quizId)

  let value

  if (body.field === 'stage_id') {
    value = Number(body.value)

    if (!Number.isInteger(value)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid stage_id' })
    }
  } else if (body.field === 'sequence_id') {
    if (body.value === null || body.value === undefined || body.value === '') {
      value = null
    } else {
      value = Number(body.value)

      if (!Number.isInteger(value)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid sequence_id' })
      }
    }
  } else if (body.field === 'source_id') {
    if (body.value === null || body.value === undefined || body.value === '') {
      value = null
    } else {
      value = String(body.value).trim()

      if (!UUID_V4_OR_V1_REGEX.test(value)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid source_id' })
      }
    }
  } else if (body.field === 'current_step') {
    if (body.value === null || body.value === undefined || body.value === '') {
      value = null
    } else {
      value = Number(body.value)

      if (!Number.isInteger(value) || value <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid current_step' })
      }
    }
  } else if (body.field === 'next_follow_up_at') {
    if (body.value === null || body.value === undefined || body.value === '') {
      value = null
    } else {
      const date = new Date(body.value)

      if (Number.isNaN(date.getTime())) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid next_follow_up_at' })
      }

      value = date.toISOString()
    }
  } else if (body.field === 'email') {
    value = String(body.value || '').trim()
    if (!EMAIL_REGEX.test(value)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
    }
  } else if (body.field === 'phone') {
    value = normalizePhone(body.value)
    if (value && !PHONE_REGEX.test(value)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid phone' })
    }
  } else {
    value = body.value // keep as string (UUID for user_id)
  }

  let result

  if (body.field === 'source_id') {
    result = await pool.query(
      `
      WITH selected_source AS (
        SELECT id
        FROM sources
        WHERE id = $1
          AND user_id = $4
        LIMIT 1
      ),
      updated AS (
        UPDATE leads
        SET source_id = CASE WHEN $1 IS NULL THEN NULL ELSE (SELECT id FROM selected_source) END,
            updated_at = NOW()
        WHERE id = $2
          AND user_id = $3
          AND quiz_id = $5
          AND ($1 IS NULL OR EXISTS (SELECT 1 FROM selected_source))
        RETURNING *
      )
      SELECT
        updated.*,
        pipeline_stages.name AS stage,
        users.name AS owner_name,
        users.email AS owner_email,
        sources.name AS source_name,
        sequences.title AS sequence_name,
        CASE
          WHEN updated.sequence_id IS NULL THEN NULL
          ELSE json_build_object(
            'id', updated.sequence_id,
            'name', sequences.title,
            'current_step', updated.current_step,
            'total_steps', (
              SELECT COUNT(*)::int
              FROM sequence_steps ss_total
              WHERE ss_total.sequence_id = updated.sequence_id
            ),
            'current_step_type', (
              SELECT ss_current.type
              FROM sequence_steps ss_current
              WHERE ss_current.sequence_id = updated.sequence_id
                AND ss_current.step_number = updated.current_step
              LIMIT 1
            ),
            'next_follow_up_at', updated.next_follow_up_at
          )
        END AS sequence
      FROM updated
      LEFT JOIN pipeline_stages
        ON updated.stage_id = pipeline_stages.id
      LEFT JOIN users
        ON updated.user_id = users.id
      LEFT JOIN sources
        ON updated.source_id = sources.id
      LEFT JOIN sequences
        ON updated.sequence_id = sequences.id
      `,
      [value, body.id, userId, userId, quizId]
    )
  } else if (body.field === 'sequence_id') {
    result = await pool.query(
      `
      WITH selected_sequence AS (
        SELECT id
        FROM sequences
        WHERE id = $1
          AND user_id = $4
        LIMIT 1
      ),
      updated AS (
        UPDATE leads
        SET sequence_id = CASE WHEN $1 IS NULL THEN NULL ELSE (SELECT id FROM selected_sequence) END,
            updated_at = NOW()
        WHERE id = $2
          AND user_id = $3
          AND quiz_id = $5
          AND ($1 IS NULL OR EXISTS (SELECT 1 FROM selected_sequence))
        RETURNING *
      )
      SELECT
        updated.*,
        pipeline_stages.name AS stage,
        users.name AS owner_name,
        users.email AS owner_email,
        sources.name AS source_name,
        sequences.title AS sequence_name,
        CASE
          WHEN updated.sequence_id IS NULL THEN NULL
          ELSE json_build_object(
            'id', updated.sequence_id,
            'name', sequences.title,
            'current_step', updated.current_step,
            'total_steps', (
              SELECT COUNT(*)::int
              FROM sequence_steps ss_total
              WHERE ss_total.sequence_id = updated.sequence_id
            ),
            'current_step_type', (
              SELECT ss_current.type
              FROM sequence_steps ss_current
              WHERE ss_current.sequence_id = updated.sequence_id
                AND ss_current.step_number = updated.current_step
              LIMIT 1
            ),
            'next_follow_up_at', updated.next_follow_up_at
          )
        END AS sequence
      FROM updated
      LEFT JOIN pipeline_stages
        ON updated.stage_id = pipeline_stages.id
      LEFT JOIN users
        ON updated.user_id = users.id
      LEFT JOIN sources
        ON updated.source_id = sources.id
      LEFT JOIN sequences
        ON updated.sequence_id = sequences.id
      `,
      [value, body.id, userId, userId, quizId]
    )
  } else {
    result = await pool.query(
      `
      WITH updated AS (
        UPDATE leads
        SET ${body.field} = $1,
            updated_at = NOW()
        WHERE id = $2
          AND user_id = $3
          AND quiz_id = $4
        RETURNING *
      )
      SELECT
        updated.*,
        pipeline_stages.name AS stage,
        users.name AS owner_name,
        users.email AS owner_email,
        sources.name AS source_name,
        sequences.title AS sequence_name,
        CASE
          WHEN updated.sequence_id IS NULL THEN NULL
          ELSE json_build_object(
            'id', updated.sequence_id,
            'name', sequences.title,
            'current_step', updated.current_step,
            'total_steps', (
              SELECT COUNT(*)::int
              FROM sequence_steps ss_total
              WHERE ss_total.sequence_id = updated.sequence_id
            ),
            'current_step_type', (
              SELECT ss_current.type
              FROM sequence_steps ss_current
              WHERE ss_current.sequence_id = updated.sequence_id
                AND ss_current.step_number = updated.current_step
              LIMIT 1
            ),
            'next_follow_up_at', updated.next_follow_up_at
          )
        END AS sequence
      FROM updated
      LEFT JOIN pipeline_stages
        ON updated.stage_id = pipeline_stages.id
      LEFT JOIN users
        ON updated.user_id = users.id
      LEFT JOIN sources
        ON updated.source_id = sources.id
      LEFT JOIN sequences
        ON updated.sequence_id = sequences.id
      `,
      [value, body.id, userId, quizId]
    )
  }

  if (!result.rows[0]) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  return result.rows[0]
})
