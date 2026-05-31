import { eventHandler } from 'h3'
import { pool } from '../../db/index.js'
import { requireUserIdentity } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { title, description, tags, questions = [] } = body

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  if (!title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template title is required'
    })
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one question is required'
    })
  }

  const validQuestions = questions.filter((q) => q?.text?.trim())

  if (validQuestions.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one valid question is required'
    })
  }

  const { userId } = requireUserIdentity(event)

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // --------------------------------------------------
    // Normalize tags
    // --------------------------------------------------

    const normalizedTags =
      typeof tags === 'string'
        ? tags
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        : []
    const tagsValue = normalizedTags.length ? JSON.stringify(normalizedTags) : null

    // --------------------------------------------------
    // Create template
    // --------------------------------------------------

    const templateRes = await client.query(
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
      [userId, title.trim(), description?.trim() || null, tagsValue]
    )

    const templateId = templateRes.rows[0].id

    // --------------------------------------------------
    // Insert questions
    // --------------------------------------------------

    for (let i = 0; i < validQuestions.length; i++) {
      const question = validQuestions[i]

      const questionType = question.type || 'open_text'

      let optionsJson = null

      // ----------------------------------------------
      // Multi / single select
      // ----------------------------------------------

      if (questionType === 'single_select' || questionType === 'multi_select') {
        const options = Array.isArray(question.options)
          ? question.options.map((o) => o?.trim()).filter(Boolean)
          : []

        if (options.length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage: `Question ${i + 1} requires options`
          })
        }

        optionsJson = {
          options
        }
      }

      // ----------------------------------------------
      // Rating
      // ----------------------------------------------

      if (questionType === 'rating') {
        optionsJson = {
          min: Number(question.min ?? 1),
          max: Number(question.max ?? 5)
        }
      }

      // ----------------------------------------------
      // Insert question
      // ----------------------------------------------

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
          templateId,
          question.text.trim(),
          questionType,
          optionsJson ? JSON.stringify(optionsJson) : null,
          i
        ]
      )
    }

    await client.query('COMMIT')

    return {
      template_id: templateId
    }
  } catch (err) {
    await client.query('ROLLBACK')

    console.error('CREATE TEMPLATE ERROR:', err)

    throw err
  } finally {
    client.release()
  }
})
