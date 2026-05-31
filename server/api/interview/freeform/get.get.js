import { pool } from '../../../db'
import { requireInterviewAccess } from '../../../utils/interviewAccess'

export default defineEventHandler(async (event) => {
  const { interview_id } = getQuery(event)

  if (!interview_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'interview_id required'
    })
  }

  const client = await pool.connect()

  try {
    // --------------------------------------------------
    // Validate access
    // --------------------------------------------------

    const interview = await requireInterviewAccess(client, event, interview_id, {
      select:
        'i.id, i.quiz_id, i.sub_uncertainty_id, i.template_id, i.respondent_info, i.started_at, i.finished_at'
    })

    // --------------------------------------------------
    // Latest condition
    // --------------------------------------------------

    const conditionRes = await client.query(
      `
      SELECT condition_id
      FROM condition_results
      WHERE interview_id = $1
      ORDER BY resolved_at DESC NULLS LAST, id DESC
      LIMIT 1
      `,
      [interview_id]
    )

    // --------------------------------------------------
    // Latest evidence
    // --------------------------------------------------

    const latestEvidenceRes = await client.query(
      `
      SELECT
        id,
        interview_id,
        condition_id,
        respondent_name,
        notes,
        evidence_log,
        structured_responses,
        created_at
      FROM evidence_entries
      WHERE interview_id = $1
      ORDER BY created_at DESC, id DESC
      LIMIT 1
      `,
      [interview_id]
    )

    // --------------------------------------------------
    // Snapshot questions
    // --------------------------------------------------

    const snapshotQuestionsRes = await client.query(
      `
      SELECT
        id,
        original_question_id,
        text,
        question_type,
        options_json,
        order_index
      FROM interview_question_snapshots
      WHERE interview_id = $1
      ORDER BY order_index ASC
      `,
      [interview_id]
    )

    return {
      interview,

      condition_id: conditionRes.rows[0]?.condition_id || null,

      evidence: latestEvidenceRes.rows[0] || null,

      template_questions: snapshotQuestionsRes.rows
    }
  } finally {
    client.release()
  }
})
