import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'
import { requireQuizAccess } from '../../../utils/quizAccess.js'

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
  const id = Number(body?.id)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const quizId = typeof body?.quiz_id === 'string' ? body.quiz_id.trim() : ''
  const steps = normalizeSteps(body?.steps)

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sequence id' })
  }

  if (!title || !quizId) {
    throw createError({ statusCode: 400, statusMessage: 'Title and quiz_id required' })
  }

  await requireQuizAccess(pool, event, quizId)

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const updated = await client.query(
      `
      UPDATE sequences
      SET title = $1,
          updated_at = NOW()
      WHERE id = $2
        AND user_id = $3
        AND quiz_id = $4
      RETURNING id
      `,
      [title, id, userId, quizId]
    )

    if (!updated.rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'Sequence not found' })
    }

    await client.query(
      `
      DELETE FROM sequence_steps
      WHERE sequence_id = $1
      `,
      [id]
    )

    for (const step of steps) {
      await client.query(
        `
        INSERT INTO sequence_steps (sequence_id, step_number, offset_days, type, title, description, quiz_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [id, step.stepNumber, step.offsetDays, step.type, step.title, step.description, quizId]
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
        AND sequences.quiz_id = $3
      GROUP BY sequences.id
      `,
      [id, userId, quizId]
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
