import { pool } from '../../../db/index.js'
import { createError } from 'h3'
import { requireInterviewAccess } from '../../../utils/interviewAccess'

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

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await requireInterviewAccess(client, event, interview_id, {
      select: 'i.id'
    })

    // --------------------------------------------------
    // Validate snapshot belongs to interview
    // --------------------------------------------------

    const snapshotRes = await client.query(
      `
      SELECT id
      , original_question_id
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

    const originalQuestionId = snapshotRes.rows[0].original_question_id

    if (!originalQuestionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Question snapshot is missing original question mapping'
      })
    }

    // --------------------------------------------------
    // Upsert answer
    // --------------------------------------------------

    await client.query(
      `
      INSERT INTO interview_answers (
        interview_id,
        question_id,
        snapshot_question_id,
        answer_text,
        answer_json
      )
      VALUES ($1, $2, $3, $4, $5)

      ON CONFLICT (interview_id, snapshot_question_id)

      DO UPDATE SET
        answer_text = EXCLUDED.answer_text,
        answer_json = EXCLUDED.answer_json,
        updated_at = NOW()
      `,
      [
        interview_id,
        originalQuestionId,
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
