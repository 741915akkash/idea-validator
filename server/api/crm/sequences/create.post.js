import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

const ALLOWED_STEP_TYPES = new Set(['call', 'email', 'note'])

function normalizeSteps(input) {
  if (!Array.isArray(input)) return []

  return input.map((step, index) => {
    const fallbackTitle = `Step ${index + 1}`
    const stepType = ALLOWED_STEP_TYPES.has(step?.type) ? step.type : 'call'
    const title = typeof step?.title === 'string' && step.title.trim() ? step.title.trim() : fallbackTitle
    const description = typeof step?.description === 'string' && step.description.trim()
      ? step.description.trim()
      : null

    return {
      stepNumber: index + 1,
      offsetDays: Number.isFinite(Number(step?.offset)) ? Math.max(0, Number(step.offset)) : 0,
      type: stepType,
      title,
      description
    }
  })
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const steps = normalizeSteps(body?.steps)

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Title required' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const sequenceInsert = await client.query(
      `
      INSERT INTO sequences (user_id, title)
      VALUES ($1, $2)
      RETURNING id, user_id, title, created_at, updated_at
      `,
      [userId, title]
    )

    const sequence = sequenceInsert.rows[0]

    for (const step of steps) {
      await client.query(
        `
        INSERT INTO sequence_steps (sequence_id, step_number, offset_days, type, title, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [sequence.id, step.stepNumber, step.offsetDays, step.type, step.title, step.description]
      )
    }

    const hydrated = await client.query(
      `
      SELECT
        sequences.id,
        sequences.title,
        sequences.created_at,
        sequences.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sequence_steps.id,
              'step_number', sequence_steps.step_number,
              'offset', sequence_steps.offset_days,
              'type', sequence_steps.type,
              'title', sequence_steps.title,
              'description', sequence_steps.description
            )
            ORDER BY sequence_steps.step_number
          ) FILTER (WHERE sequence_steps.id IS NOT NULL),
          '[]'::json
        ) AS steps
      FROM sequences
      LEFT JOIN sequence_steps
        ON sequence_steps.sequence_id = sequences.id
      WHERE sequences.id = $1
        AND sequences.user_id = $2
      GROUP BY sequences.id
      `,
      [sequence.id, userId]
    )

    await client.query('COMMIT')
    return hydrated.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
