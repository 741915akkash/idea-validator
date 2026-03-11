import { pool } from '../../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { interview_id, condition_id, status } = body

  if (!interview_id || !condition_id || !['pending', 'met', 'failed'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1️⃣ Update runtime condition result
    await client.query(
      `
      UPDATE condition_results
      SET status = $1,
          resolved_at = CASE WHEN $1 != 'pending' THEN now() ELSE NULL END
      WHERE interview_id = $2
        AND condition_id = $3
      `,
      [status, interview_id, condition_id]
    )

    // 2️⃣ Check if any pending remain
    const pendingRes = await client.query(
      `
      SELECT COUNT(*) FROM condition_results
      WHERE interview_id = $1
        AND status = 'pending'
      `,
      [interview_id]
    )

    const remainingPending = parseInt(pendingRes.rows[0].count)

    if (remainingPending === 0) {
      // 3️⃣ Determine final completion status
      const failedRes = await client.query(
        `
        SELECT COUNT(*) FROM condition_results
        WHERE interview_id = $1
          AND status = 'failed'
        `,
        [interview_id]
      )

      const hasFailures = parseInt(failedRes.rows[0].count) > 0

      const completionStatus = hasFailures ? 'not_met' : 'met'

      // 4️⃣ Mark interview finished
      await client.query(
        `
        UPDATE interviews
        SET finished_at = now(),
            completion_status = $2,
            status = 'completed'
        WHERE id = $1
        `,
        [interview_id, completionStatus]
      )

      // 5️⃣ If fully met → mark sub resolved
      if (!hasFailures) {
        await client.query(
          `
          UPDATE sub_uncertainties
          SET status = 'resolved'
          WHERE id = (
            SELECT sub_uncertainty_id
            FROM interviews
            WHERE id = $1
          )
          `,
          [interview_id]
        )
      }
    }

    await client.query('COMMIT')

    return { ok: true }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})
