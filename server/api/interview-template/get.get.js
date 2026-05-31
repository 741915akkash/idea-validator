import { pool } from '../../db/index.js'
import { createError } from 'h3'
import { requireUserIdentity } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const { template_id } = query

  if (!template_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'template_id is required'
    })
  }

  const { userId } = requireUserIdentity(event)

  const client = await pool.connect()

  try {
    // --------------------------------------------------
    // Template
    // --------------------------------------------------

    const templateRes = await client.query(
      `
      SELECT
        id,
        title,
        description,
        tags,
        created_at,
        updated_at
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
    // Questions
    // --------------------------------------------------

    const questionsRes = await client.query(
      `
      SELECT
        id,
        text,
        question_type,
        options_json,
        order_index
      FROM interview_questions
      WHERE template_id = $1
      ORDER BY order_index ASC
      `,
      [template_id]
    )

    return {
      template: templateRes.rows[0],
      questions: questionsRes.rows
    }
  } finally {
    client.release()
  }
})
