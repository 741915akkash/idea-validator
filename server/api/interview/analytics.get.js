import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const { quiz_id, sub_uncertainty_id } = getQuery(event)

  if (!quiz_id || !sub_uncertainty_id) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id and sub_uncertainty_id required' })
  }

  const subRes = await pool.query(
    `
    SELECT
      s.id,
      s.title,
      s.uncertainty_id,
      u.text AS uncertainty_text,
      g.id AS goal_id,
      g.statement AS goal_statement
    FROM sub_uncertainties s
    LEFT JOIN uncertainties u ON u.id = s.uncertainty_id
    LEFT JOIN goals g ON g.sub_uncertainty_id = s.id
    WHERE s.id = $1
    LIMIT 1
    `,
    [sub_uncertainty_id]
  )

  if (!subRes.rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Sub-uncertainty not found' })
  }

  const subUncertainty = subRes.rows[0]

  const interviewsRes = await pool.query(
    `
    SELECT
      i.id,
      i.respondent_info,
      i.started_at,
      i.finished_at,
      i.sub_uncertainty_id
    FROM interviews i
    WHERE i.quiz_id = $1
      AND i.sub_uncertainty_id = $2
    ORDER BY i.started_at DESC
    `,
    [quiz_id, sub_uncertainty_id]
  )

  const interviews = interviewsRes.rows
  const interviewIds = interviews.map((i) => i.id)

  const conditionsRes = await pool.query(
    `
    SELECT
      c.id,
      c.goal_id,
      c.description,
      c.order_index
    FROM conditions c
    JOIN goals g ON g.id = c.goal_id
    WHERE g.sub_uncertainty_id = $1
    ORDER BY c.order_index ASC, c.id ASC
    `,
    [sub_uncertainty_id]
  )

  let responses = []
  if (interviewIds.length) {
    const responsesRes = await pool.query(
      `
      SELECT
        cr.interview_id,
        cr.condition_id,
        cr.status,
        ev.notes,
        ev.evidence_log
      FROM condition_results cr
      LEFT JOIN LATERAL (
        SELECT e.notes, e.evidence_log
        FROM evidence_entries e
        WHERE e.interview_id = cr.interview_id
          AND e.condition_id = cr.condition_id
        ORDER BY e.created_at DESC, e.id DESC
        LIMIT 1
      ) ev ON TRUE
      WHERE cr.interview_id = ANY($1::uuid[])
      `,
      [interviewIds]
    )
    responses = responsesRes.rows
  }

  return {
    sub_uncertainty: subUncertainty,
    interviews,
    conditions: conditionsRes.rows,
    responses
  }
})
