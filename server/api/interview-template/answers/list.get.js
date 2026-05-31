import { pool } from '../../../db/index.js'
import { createError } from 'h3'
import { requireUserIdentity } from '../../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const { interview_id } = query

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  if (!interview_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'interview_id is required'
    })
  }

  const { userId } = requireUserIdentity(event)

  const client = await pool.connect()

  try {
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
    // Fetch answers + snapshot question data
    // --------------------------------------------------

    const answersRes = await client.query(
      `
      SELECT
        ia.id,

        ia.snapshot_question_id,

        ia.answer_text,
        ia.answer_json,

        ia.created_at,
        ia.updated_at,

        qs.text,
        qs.question_type,
        qs.options_json,
        qs.order_index

      FROM interview_answers ia

      JOIN interview_question_snapshots qs
        ON qs.id = ia.snapshot_question_id

      WHERE ia.interview_id = $1

      ORDER BY qs.order_index ASC
      `,
      [interview_id]
    )

    return {
      answers: answersRes.rows
    }
  } finally {
    client.release()
  }
})
