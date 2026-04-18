import { pool } from '../../db'
import { requireQuizAccess } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const { quiz_id } = getQuery(event)

  if (!quiz_id) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  const client = await pool.connect()
  try {
    await requireQuizAccess(client, event, quiz_id, { includeArchived: true })

    const { rows } = await client.query(
      `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE finished_at IS NOT NULL) AS completed,
        COUNT(*) FILTER (WHERE finished_at IS NULL) AS in_progress
      FROM interviews
      WHERE quiz_id = $1
      `,
      [quiz_id]
    )

    return {
      total: Number(rows[0].total),
      completed: Number(rows[0].completed),
      inProgress: Number(rows[0].in_progress)
    }
  } finally {
    client.release()
  }
})
