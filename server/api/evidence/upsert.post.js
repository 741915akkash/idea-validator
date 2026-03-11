import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { interview_id, condition_id, respondent_name, notes, evidence_log, structured_responses } = body

  if (!interview_id || !condition_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'interview_id and condition_id required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Ensure column exists for separate evidence log autosave.
    await client.query(`ALTER TABLE evidence_entries ADD COLUMN IF NOT EXISTS evidence_log text`)

    const interviewRes = await client.query(
      `
      SELECT id, sub_uncertainty_id
      FROM interviews
      WHERE id = $1
      `,
      [interview_id]
    )

    if (!interviewRes.rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'Interview not found' })
    }

    const conditionRes = await client.query(
      `
      SELECT c.id
      FROM conditions c
      JOIN goals g ON g.id = c.goal_id
      JOIN sub_uncertainties s ON s.id = g.sub_uncertainty_id
      JOIN interviews i ON i.sub_uncertainty_id = s.id
      WHERE c.id = $1
        AND i.id = $2
      `,
      [condition_id, interview_id]
    )

    if (!conditionRes.rows.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Condition does not belong to this interview'
      })
    }

    const existingRes = await client.query(
      `
      SELECT id
      FROM evidence_entries
      WHERE interview_id = $1
        AND condition_id = $2
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [interview_id, condition_id]
    )

    let evidence

    if (existingRes.rows.length) {
      const updateRes = await client.query(
        `
        UPDATE evidence_entries
        SET respondent_name = $1,
            notes = $2,
            evidence_log = $3,
            structured_responses = $4
        WHERE id = $5
        RETURNING *
        `,
        [
          respondent_name || null,
          notes || null,
          evidence_log || null,
          structured_responses || null,
          existingRes.rows[0].id
        ]
      )
      evidence = updateRes.rows[0]
    } else {
      const insertRes = await client.query(
        `
        INSERT INTO evidence_entries
        (interview_id, condition_id, respondent_name, notes, evidence_log, structured_responses)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          interview_id,
          condition_id,
          respondent_name || null,
          notes || null,
          evidence_log || null,
          structured_responses || null
        ]
      )
      evidence = insertRes.rows[0]
    }

    await client.query('COMMIT')

    return { evidence }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})
