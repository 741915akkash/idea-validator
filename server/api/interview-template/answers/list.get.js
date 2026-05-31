import { pool } from '../../../db/index.js'
import { createError } from 'h3'
import { requireInterviewAccess } from '../../../utils/interviewAccess'

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

  const client = await pool.connect()

  try {
    await requireInterviewAccess(client, event, interview_id, {
      select: 'i.id'
    })

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
