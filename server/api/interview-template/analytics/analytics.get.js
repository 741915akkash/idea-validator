import { pool } from '../../../db/index.js'
import { createError } from 'h3'
import { requireUserIdentity } from '../../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const { template_id } = query

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  if (!template_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'template_id is required'
    })
  }

  const version =
    query.version !== undefined && query.version !== null ? Number(query.version) : null

  const { userId } = requireUserIdentity(event)

  const client = await pool.connect()

  try {
    // --------------------------------------------------
    // Validate template ownership
    // --------------------------------------------------

    const templateRes = await client.query(
      `
      SELECT
        id,
        title,
        description,
        version,
        created_at,
        updated_at
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
    // Total interviews
    // --------------------------------------------------

    const totalInterviewsRes = await client.query(
      `
      SELECT COUNT(*)::int AS total
      FROM interviews
      WHERE template_id = $1
      AND ($2::int IS NULL OR template_version = $2)
      `,
      [template_id, version]
    )

    const totalInterviews = totalInterviewsRes.rows[0]?.total || 0

    // --------------------------------------------------
    // Fetch snapshot questions + answers
    // --------------------------------------------------

    const analyticsRes = await client.query(
      `
      SELECT
        qs.id AS snapshot_question_id,
        qs.text,
        qs.question_type,
        qs.options_json,
        qs.order_index,

        i.template_version,

        ia.answer_text,
        ia.answer_json

      FROM interview_question_snapshots qs

      JOIN interviews i
        ON i.id = qs.interview_id

      LEFT JOIN interview_answers ia
        ON ia.snapshot_question_id = qs.id

      WHERE i.template_id = $1
      AND ($2::int IS NULL OR i.template_version = $2)

      ORDER BY
        i.template_version DESC,
        qs.order_index ASC,
        qs.created_at ASC
      `,
      [template_id, version]
    )

    // --------------------------------------------------
    // Group questions
    // --------------------------------------------------

    const groupedQuestions = new Map()

    for (const row of analyticsRes.rows) {
      const key = `${row.text}__${row.question_type}__${JSON.stringify(row.options_json || {})}`

      if (!groupedQuestions.has(key)) {
        groupedQuestions.set(key, {
          text: row.text,
          question_type: row.question_type,
          options_json: row.options_json,
          order_index: row.order_index,

          answers: [],

          versions: new Set()
        })
      }

      const group = groupedQuestions.get(key)

      group.answers.push({
        answer_text: row.answer_text,
        answer_json: row.answer_json
      })

      if (row.template_version !== null) {
        group.versions.add(row.template_version)
      }
    }

    // --------------------------------------------------
    // Build analytics
    // --------------------------------------------------

    const questions = []

    for (const [, group] of groupedQuestions.entries()) {
      const { text, question_type, options_json, order_index, answers, versions } = group

      let analytics = null

      // ==================================================
      // YES / NO
      // ==================================================

      if (question_type === 'yes_no') {
        let yes = 0
        let no = 0

        for (const answer of answers) {
          const value = answer.answer_text?.toLowerCase()

          if (value === 'yes') yes++
          if (value === 'no') no++
        }

        const total = yes + no

        analytics = {
          total,

          counts: {
            yes,
            no
          },

          percentages: {
            yes: total ? Math.round((yes / total) * 100) : 0,
            no: total ? Math.round((no / total) * 100) : 0
          }
        }
      }

      // ==================================================
      // SINGLE SELECT
      // ==================================================
      else if (question_type === 'single_select') {
        const counts = {}

        for (const answer of answers) {
          const value = answer.answer_text

          if (!value) continue

          counts[value] = (counts[value] || 0) + 1
        }

        const total = Object.values(counts).reduce((a, b) => a + b, 0)

        analytics = {
          total,

          options: Object.entries(counts)
            .map(([label, count]) => ({
              label,
              count,
              percentage: total ? Math.round((count / total) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
        }
      }

      // ==================================================
      // MULTI SELECT
      // ==================================================
      else if (question_type === 'multi_select') {
        const counts = {}

        for (const answer of answers) {
          let values = answer.answer_json

          if (values && typeof values === 'object' && !Array.isArray(values)) {
            values = values.selected || []
          }

          if (!Array.isArray(values)) continue

          for (const value of values) {
            counts[value] = (counts[value] || 0) + 1
          }
        }

        const total = Object.values(counts).reduce((a, b) => a + b, 0)

        analytics = {
          total,

          options: Object.entries(counts)
            .map(([label, count]) => ({
              label,
              count,
              percentage: total ? Math.round((count / total) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
        }
      }

      // ==================================================
      // RATING
      // ==================================================
      else if (question_type === 'rating') {
        const values = answers.map((a) => Number(a.answer_text)).filter((v) => !Number.isNaN(v))

        const total = values.length

        const average = total > 0 ? values.reduce((a, b) => a + b, 0) / total : 0

        const distribution = {}

        for (const value of values) {
          distribution[value] = (distribution[value] || 0) + 1
        }

        analytics = {
          total,

          average: Number(average.toFixed(1)),

          min: total ? Math.min(...values) : null,
          max: total ? Math.max(...values) : null,

          distribution: Object.entries(distribution)
            .map(([value, count]) => ({
              value: Number(value),
              count
            }))
            .sort((a, b) => a.value - b.value)
        }
      }

      // ==================================================
      // NUMBER
      // ==================================================
      else if (question_type === 'number') {
        const values = answers.map((a) => Number(a.answer_text)).filter((v) => !Number.isNaN(v))

        const total = values.length

        const average = total > 0 ? values.reduce((a, b) => a + b, 0) / total : 0

        analytics = {
          total,

          average: Number(average.toFixed(1)),

          min: total ? Math.min(...values) : null,
          max: total ? Math.max(...values) : null
        }
      }

      // ==================================================
      // OPEN TEXT
      // ==================================================
      else if (question_type === 'open_text') {
        const responses = answers
          .map((a) => a.answer_text?.trim())
          .filter((value) => Boolean(value))

        analytics = {
          total_answers: responses.length,
          responses,

          status: 'open_text_analysis_pending'
        }
      }

      questions.push({
        text,
        question_type,
        options_json,
        order_index,

        versions: Array.from(versions).sort((a, b) => a - b),

        analytics
      })
    }

    // --------------------------------------------------
    // Sort
    // --------------------------------------------------

    questions.sort((a, b) => a.order_index - b.order_index)

    return {
      template,

      selected_version: version,

      total_interviews: totalInterviews,

      questions
    }
  } catch (err) {
    console.error('TEMPLATE ANALYTICS ERROR:', err)

    throw err
  } finally {
    client.release()
  }
})
