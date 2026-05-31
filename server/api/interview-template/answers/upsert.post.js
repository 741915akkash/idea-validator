import { pool } from '../../../db/index.js'
import { createError } from 'h3'
import { requireUserIdentity } from '../../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    interview_id,
    snapshot_question_id,

    answer_text = null,
    answer_json = null
  } = body

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  if (!interview_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'interview_id is required'
    })
  }

  if (!snapshot_question_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'snapshot_question_id is required'
    })
  }

  const { userId } = requireUserIdentity(event)

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // --------------------------------------------------
    // Validate interview ownership
    // --------------------------------------------------

    const interviewRes = await client.query(
      `
      SELECT
        i.id,
        i.template_id
      FROM interviews i
      WHERE i.id = $1
      AND EXISTS (
        SELECT 1
        FROM interview_templates t
        WHERE t.id = i.template_id
        AND t.user_id = $2
      )
      LIMIT 1
      `,
      [interview_id, userId]
    )

    if (interviewRes.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Interview not found'
      })
    }

    // --------------------------------------------------
    // Validate snapshot belongs to interview
    // --------------------------------------------------

    const snapshotRes = await client.query(
      `
      SELECT id
      FROM interview_question_snapshots
      WHERE id = $1
      AND interview_id = $2
      LIMIT 1
      `,
      [snapshot_question_id, interview_id]
    )

    if (snapshotRes.rows.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Question snapshot does not belong to interview'
      })
    }

    // --------------------------------------------------
    // Upsert answer
    // --------------------------------------------------

    await client.query(
      `
      INSERT INTO interview_answers (
        interview_id,
        snapshot_question_id,
        answer_text,
        answer_json
      )
      VALUES ($1, $2, $3, $4)

      ON CONFLICT (interview_id, snapshot_question_id)

      DO UPDATE SET
        answer_text = EXCLUDED.answer_text,
        answer_json = EXCLUDED.answer_json,
        updated_at = NOW()
      `,
      [
        interview_id,
        snapshot_question_id,
        answer_text?.trim() || null,
        answer_json ? JSON.stringify(answer_json) : null
      ]
    )

    await client.query('COMMIT')

    return {
      success: true
    }
  } catch (err) {
    await client.query('ROLLBACK')

    console.error('UPSERT INTERVIEW ANSWER ERROR:', err)

    throw err
  } finally {
    client.release()
  }
})
