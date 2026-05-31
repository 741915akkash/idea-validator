import { pool } from '../../db/index.js'
import { createError } from 'h3'
import { requireUserIdentity } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { template_id, title, description, tags, questions = [] } = body

  if (!template_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'template_id is required'
    })
  }

  if (!title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template title is required'
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
      SELECT
        id,
        version
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
    // Fetch existing template questions
    // --------------------------------------------------

    const existingQuestionsRes = await client.query(
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

    const existingQuestions = existingQuestionsRes.rows

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
    // Normalize incoming questions
    // --------------------------------------------------

    const validQuestions = questions.filter((q) => q?.text?.trim())

    const normalizedIncomingQuestions = validQuestions.map((q, index) => {
      const questionType = q.type || 'open_text'

      let optionsJson = null

      if (questionType === 'single_select' || questionType === 'multi_select') {
        optionsJson = {
          options: (q.options || []).filter(Boolean)
        }
      }

      if (questionType === 'rating') {
        optionsJson = {
          min: Number(q.min ?? 1),
          max: Number(q.max ?? 5)
        }
      }

      return {
        text: q.text.trim(),
        question_type: questionType,
        options_json: optionsJson,
        order_index: index
      }
    })

    const normalizedExistingQuestions = existingQuestions.map((q) => ({
      text: q.text,
      question_type: q.question_type,
      options_json: q.options_json,
      order_index: q.order_index
    }))

    // --------------------------------------------------
    // Detect structure changes
    // --------------------------------------------------

    const structureChanged =
      JSON.stringify(normalizedExistingQuestions) !== JSON.stringify(normalizedIncomingQuestions)

    // --------------------------------------------------
    // Update template
    // --------------------------------------------------

    await client.query(
      `
      UPDATE interview_templates
      SET
        title = $1,
        description = $2,
        tags = $3,

        version =
          CASE
            WHEN $5 = true
            THEN version + 1
            ELSE version
          END,

        updated_at = NOW()

      WHERE id = $4
      `,
      [title.trim(), description?.trim() || null, tagsValue, template_id, structureChanged]
    )

    // --------------------------------------------------
    // Replace questions
    // --------------------------------------------------

    await client.query(
      `
      DELETE FROM interview_questions
      WHERE template_id = $1
      `,
      [template_id]
    )

    for (let i = 0; i < normalizedIncomingQuestions.length; i++) {
      const question = normalizedIncomingQuestions[i]

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
          template_id,
          question.text,
          question.question_type,
          question.options_json ? JSON.stringify(question.options_json) : null,
          question.order_index
        ]
      )
    }

    await client.query('COMMIT')

    return {
      success: true,
      version_incremented: structureChanged
    }
  } catch (err) {
    await client.query('ROLLBACK')

    console.error('UPDATE TEMPLATE ERROR:', err)

    throw err
  } finally {
    client.release()
  }
})
