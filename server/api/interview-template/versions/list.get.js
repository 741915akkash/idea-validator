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

  const { userId } = requireUserIdentity(event)

  const client = await pool.connect()

  try {
    // --------------------------------------------------
    // Validate ownership
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
    // Fetch interviews grouped by template_version
    // --------------------------------------------------

    const versionsRes = await client.query(
      `
      SELECT
        i.template_version AS version,

        COUNT(DISTINCT i.id)::int AS total_interviews,

        COUNT(DISTINCT ia.id)::int AS total_answers,

        MIN(i.started_at) AS first_used_at,
        MAX(i.started_at) AS last_used_at

      FROM interviews i

      LEFT JOIN interview_answers ia
        ON ia.interview_id = i.id

      WHERE i.template_id = $1

      GROUP BY i.template_version

      ORDER BY i.template_version DESC NULLS LAST
      `,
      [template_id]
    )

    // --------------------------------------------------
    // Fetch question counts by version
    // --------------------------------------------------

    const questionCountsRes = await client.query(
      `
      SELECT
        version,
        COUNT(*)::int AS total_questions
      FROM (
        SELECT
          i.template_version AS version,
          qs.text,
          qs.question_type
        FROM interviews i

        JOIN interview_question_snapshots qs
          ON qs.interview_id = i.id

        WHERE i.template_id = $1

        GROUP BY
          i.template_version,
          qs.text,
          qs.question_type
      ) grouped

      GROUP BY version

      ORDER BY version DESC NULLS LAST
      `,
      [template_id]
    )

    const questionCountsMap = new Map()

    for (const row of questionCountsRes.rows) {
      questionCountsMap.set(Number(row.version), row.total_questions)
    }

    // --------------------------------------------------
    // Build versions list
    // --------------------------------------------------

    const versions = versionsRes.rows.map((row) => ({
      version: row.version || 1,

      total_interviews: row.total_interviews || 0,

      total_answers: row.total_answers || 0,

      total_questions: questionCountsMap.get(Number(row.version)) || 0,

      first_used_at: row.first_used_at,

      last_used_at: row.last_used_at,

      is_current: Number(row.version) === Number(template.version)
    }))

    // --------------------------------------------------
    // Ensure current version exists
    // --------------------------------------------------

    const hasCurrentVersion = versions.some((v) => Number(v.version) === Number(template.version))

    if (!hasCurrentVersion) {
      versions.unshift({
        version: template.version,

        total_interviews: 0,
        total_answers: 0,
        total_questions: 0,

        first_used_at: null,
        last_used_at: null,

        is_current: true
      })
    }

    // --------------------------------------------------
    // Sort descending
    // --------------------------------------------------

    versions.sort((a, b) => b.version - a.version)

    return {
      template: {
        id: template.id,
        title: template.title,
        description: template.description,
        version: template.version,
        created_at: template.created_at,
        updated_at: template.updated_at
      },

      versions
    }
  } finally {
    client.release()
  }
})
