import { pool } from '../../db/index.js'

export default defineEventHandler(async (event) => {
  // 🔐 get logged-in user
  const userId = event.context.user?.id

  const body = await readBody(event)

  const name = typeof body.name === 'string' ? body.name.trim() : ''

  // ❌ validation
  if (!name || name.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name must be at least 2 characters'
    })
  }

  // ✅ update user
  const result = await pool.query(
    `
    UPDATE users
    SET name = $1
    WHERE id = $2
    RETURNING id, name, email
    `,
    [name, userId]
  )

  if (!result.rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  return result.rows[0]
})
