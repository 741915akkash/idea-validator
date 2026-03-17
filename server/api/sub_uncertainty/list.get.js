import { pool } from '../../db'
import { requireUncertaintyAccess } from '../../utils/subUncertaintyAccess'

export default defineEventHandler(async (event) => {
  const { uncertainty_id } = getQuery(event)

  if (!uncertainty_id) {
    throw createError({ statusCode: 400, statusMessage: 'uncertainty_id required' })
  }

  const client = await pool.connect()
  try {
    await requireUncertaintyAccess(client, event, uncertainty_id)

    const { rows } = await client.query(
      `
      SELECT
        s.id,
        s.uncertainty_id,
        s.title,
        COUNT(i.id) AS interview_count
      FROM sub_uncertainties s
      LEFT JOIN interviews i ON i.sub_uncertainty_id = s.id
      WHERE s.uncertainty_id = $1
      GROUP BY s.id, s.uncertainty_id, s.title
      ORDER BY s.created_at ASC NULLS LAST, s.title ASC
      `,
      [uncertainty_id]
    )

    return rows.map((row) => ({
      ...row,
      interview_count: Number(row.interview_count)
    }))
  } finally {
    client.release()
  }
})
