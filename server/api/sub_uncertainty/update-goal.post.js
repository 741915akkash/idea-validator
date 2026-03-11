import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { goal_id, statement } = body

  if (!goal_id || !statement?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'goal_id and statement required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const res = await client.query(
      `
      UPDATE goals
      SET statement = $1
      WHERE id = $2
      RETURNING id
      `,
      [statement.trim(), goal_id]
    )

    if (res.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Goal not found'
      })
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
