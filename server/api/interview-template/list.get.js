import { pool } from '../../db/index.js'
import { requireUserIdentity } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const { userId } = requireUserIdentity(event)

  const client = await pool.connect()

  try {
    const res = await client.query(
      `
      SELECT
        t.id,
        t.title,
        t.description,
        t.tags,
        t.version,
        t.created_at,
        t.updated_at,

        COUNT(DISTINCT q.id) AS question_count,
        COUNT(DISTINCT i.id) AS interview_count

      FROM interview_templates t

      LEFT JOIN interview_questions q
        ON q.template_id = t.id

      LEFT JOIN interviews i
        ON i.template_id = t.id

      WHERE t.user_id = $1

      GROUP BY t.id

      ORDER BY t.updated_at DESC
      `,
      [userId]
    )

    return {
      templates: res.rows
    }
  } finally {
    client.release()
  }
})
