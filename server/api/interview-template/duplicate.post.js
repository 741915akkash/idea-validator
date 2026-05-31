import { pool } from '../../db/index.js'
import { createError } from 'h3'
import { requireUserIdentity } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { template_id } = body

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

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
    // Fetch template
    // --------------------------------------------------

    const templateRes = await client.query(
      `
      SELECT
        id,
        title,
        description,
        tags
      FROM interview_templates
      WHERE id = $1
      AND user_id = $2
      LIMIT 1
      `,
      [template_id, userId]
    )

    if (!templateRes.rows.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Template not found'
      })
    }

    const template = templateRes.rows[0]

    // --------------------------------------------------
    // Fetch questions
    // --------------------------------------------------

    const questionsRes = await client.query(
      `
      SELECT
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

    // --------------------------------------------------
    // Create duplicated template
    // --------------------------------------------------

    const duplicatedTemplateRes = await client.query(
      `
      INSERT INTO interview_templates (
        user_id,
        title,
        description,
        tags
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [
        userId,
        `${template.title} (Copy)`,
        template.description,
        JSON.stringify(template.tags || [])
      ]
    )

    const duplicatedTemplateId = duplicatedTemplateRes.rows[0].id

    // --------------------------------------------------
    // Copy questions
    // --------------------------------------------------

    for (const question of questionsRes.rows) {
      await client.query(
        `
        INSERT INTO interview_questions (
          template_id,
          text,
          question_type,
          options_json,
          order_index
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          duplicatedTemplateId,
          question.text,
          question.question_type,
          question.options_json,
          question.order_index
        ]
      )
    }

    await client.query('COMMIT')

    return {
      template_id: duplicatedTemplateId
    }
  } catch (err) {
    await client.query('ROLLBACK')

    console.error('DUPLICATE TEMPLATE ERROR:', err)

    throw err
  } finally {
    client.release()
  }
})
