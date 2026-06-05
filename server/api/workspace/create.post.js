import { eventHandler } from 'h3'
import { pool } from '../../db'
import { requireUserIdentity } from '../../utils/quizAccess'

export default eventHandler(async (event) => {
  const { userId } = requireUserIdentity(event)

  const client = await pool.connect()

  try {
    const result = await client.query(
      `
      INSERT INTO workspaces (
        user_id,
        name,
        status,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        'Untitled Startup',
        'active',
        now(),
        now()
      )
      RETURNING id
      `,
      [userId]
    )

    return {
      workspace_id: result.rows[0].id
    }
  } finally {
    client.release()
  }
})
