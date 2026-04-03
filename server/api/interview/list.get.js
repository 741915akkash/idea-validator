import { pool } from '../../db'
import { requireQuizAccess } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const { quiz_id, sub_uncertainty_id } = getQuery(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id required'
    })
  }

  const whereClauses = ['i.quiz_id = $1']
  const params = [quiz_id]

  const client = await pool.connect()
  try {
    await requireQuizAccess(client, event, quiz_id)

    if (sub_uncertainty_id) {
      params.push(sub_uncertainty_id)
      whereClauses.push(`i.sub_uncertainty_id = $${params.length}`)
    }

    const { rows } = await client.query(
      `
      SELECT
        i.id,
        i.name,
        i.respondent_info,
        i.sub_uncertainty_id,
        i.started_at,
        i.finished_at,
        s.title AS sub_uncertainty,
        ev.notes AS latest_notes,
        ev.evidence_log AS latest_evidence_log,
        ev.structured_responses AS latest_structured_responses
      FROM interviews i
      LEFT JOIN sub_uncertainties s ON s.id = i.sub_uncertainty_id
      LEFT JOIN LATERAL (
        SELECT e.notes, e.evidence_log, e.structured_responses, e.created_at
        FROM evidence_entries e
        WHERE e.interview_id = i.id
        ORDER BY e.created_at DESC, e.id DESC
        LIMIT 1
      ) ev ON true
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY i.started_at DESC
      `,
      params
    )

    return rows
  } finally {
    client.release()
  }
})
