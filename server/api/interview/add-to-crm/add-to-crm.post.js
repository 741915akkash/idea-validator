import { pool } from '../../../db'

export async function addInterviewToCrm({ client, interviewId, userId = null }) {
  // Mark interview completed in this same transaction.
  await client.query(
    `
    UPDATE interviews
    SET
      finished_at = NOW(),
      completion_status = 'completed'
    WHERE id = $1
    `,
    [interviewId]
  )

  const existingByInterviewRes = await client.query(
    `
    SELECT id
    FROM leads
    WHERE interview_id = $1
    LIMIT 1
    `,
    [interviewId]
  )

  if (existingByInterviewRes.rows.length > 0) {
    return { ok: true, skipped: 'duplicate_interview' }
  }

  const res = await client.query(
    `
    SELECT e.structured_responses
    FROM evidence_entries e
    WHERE e.interview_id = $1
    ORDER BY e.created_at DESC
    LIMIT 1
    `,
    [interviewId]
  )

  const data = res.rows[0]
  if (!data) {
    return { ok: true }
  }

  const s = data.structured_responses || {}

  const name = s.name?.trim() || 'Unknown'
  const email = s.email?.trim() || null
  const phone = s.phone?.trim() || null
  const company = s.company?.trim() || null

  const stageRes = await client.query(`SELECT id FROM pipeline_stages ORDER BY id ASC LIMIT 1`)
  const stageId = stageRes.rows[0]?.id || null

  let sourceId = null
  const sourceRes = await client.query(
    `SELECT id FROM sources WHERE lower(name) = 'interview' AND user_id IS NULL LIMIT 1`
  )
  if (sourceRes.rows.length) {
    sourceId = sourceRes.rows[0].id
  }

  await client.query(
    `
    INSERT INTO leads (
      name,
      email,
      phone,
      company,
      stage_id,
      user_id,
      source_id,
      interview_id,
      created_at,
      updated_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
    `,
    [name, email, phone, company, stageId, userId, sourceId, interviewId]
  )

  return { ok: true }
}

export default defineEventHandler(async (event) => {
  const { interview_id } = await readBody(event)

  if (!interview_id) {
    throw createError({ statusCode: 400, statusMessage: 'interview_id required' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const userId = event.context?.user?.id || event.context?.auth?.userId || null
    const result = await addInterviewToCrm({
      client,
      interviewId: interview_id,
      userId
    })

    await client.query('COMMIT')

    return result
  } catch (err) {
    try {
      await client.query('ROLLBACK')
    } catch {}

    console.error('Interview → CRM error:', err)
    throw err
  } finally {
    client.release()
  }
})
