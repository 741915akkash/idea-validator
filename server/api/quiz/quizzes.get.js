import { eventHandler, getQuery } from 'h3'
import { pool } from '../../db'
import { requireIdentity, requireWorkspaceAccess } from '../../utils/quizAccess'

export default eventHandler(async (event) => {
  const { workspace_id } = getQuery(event)
  const { userId, visitorId } = requireIdentity(event)
  const client = await pool.connect()

  try {
    const res = userId && workspace_id
      ? await (async () => {
          await requireWorkspaceAccess(client, event, workspace_id, {
            select: 'id'
          })

          return client.query(
            `
            SELECT
              id,
              name,
              status,
              parent_quiz_id,
              revision_number,
              archived_at,
              workspace_id
            FROM quizzes
            WHERE workspace_id = $1
            ORDER BY
              (archived_at IS NOT NULL),
              COALESCE(parent_quiz_id, id),
              revision_number
            `,
            [workspace_id]
          )
        })()
      : userId
      ? await client.query(
          `
          SELECT
            id,
            name,
            status,
            parent_quiz_id,
            revision_number,
            archived_at,
            workspace_id
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
            archived_at,
            workspace_id
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
