import { pool } from '../../db/index.js'
import { createError } from 'h3'
import { requireUserIdentity } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { template_id } = body

  if (!template_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'template_id is required'
    })
  }

  const { userId } = requireUserIdentity(event)

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // --------------------------------------------------
    // Validate ownership
    // --------------------------------------------------

    const templateRes = await client.query(
      `
      SELECT id
      FROM interview_templates
      WHERE id = $1
      AND user_id = $2
      LIMIT 1
      `,
      [template_id, userId]
    )

    if (templateRes.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Template not found'
      })
    }

    // --------------------------------------------------
    // Delete template
    // --------------------------------------------------

    await client.query(
      `
      DELETE FROM interview_templates
      WHERE id = $1
      `,
      [template_id]
    )

    await client.query('COMMIT')

    return {
      success: true
    }
  } catch (err) {
    await client.query('ROLLBACK')

    console.error('DELETE TEMPLATE ERROR:', err)

    throw err
  } finally {
    client.release()
  }
})
