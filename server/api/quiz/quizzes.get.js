import { eventHandler } from 'h3'
import { pool } from '../../db'
import { requireIdentity } from '../../utils/quizAccess'

export default eventHandler(async (event) => {
  const { userId, visitorId } = requireIdentity(event)
  const client = await pool.connect()

  try {
    const res = userId
      ? await client.query(
          `
          SELECT
            id,
            name,
            status,
            parent_quiz_id,
            revision_number,
            archived_at
          FROM quizzes
          WHERE user_id = $1
          ORDER BY
            (archived_at IS NOT NULL),
            COALESCE(parent_quiz_id, id),
            revision_number
          `,
          [userId]
        )
      : await client.query(
          `
          SELECT
            id,
            name,
            status,
            parent_quiz_id,
            revision_number,
            archived_at
          FROM quizzes
          WHERE visitor_id = $1
          ORDER BY
            (archived_at IS NOT NULL),
            COALESCE(parent_quiz_id, id),
            revision_number
          `,
          [visitorId]
        )

    return res.rows
  } finally {
    client.release()
  }
})
