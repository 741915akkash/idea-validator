import { eventHandler, getQuery } from 'h3'
import { pool } from '../../db/index.js'

export default eventHandler(async (event) => {
  const { query, quizId } = getQuery(event)

  if (!query || !quizId) {
    return {
      results: []
    }
  }

  let client

  try {
    client = await pool.connect()
    const tableCheck = await client.query(
      `SELECT to_regclass('public.knowledge_base_notes') IS NOT NULL AS exists`
    )
    const hasKnowledgeBaseNotes = Boolean(tableCheck.rows[0]?.exists)

    const baseSelect = `
      SELECT
        (qqn.quiz_id::text || '-' || qqn.question_id::text) AS id,
        qqn.question_id,
        qqn.note_text,
        qqn.created_at,
        q.checkpoint,
        NULL::text AS title,
        'question_note'::text AS source,
        '[]'::jsonb AS tags
      FROM quiz_question_notes qqn
      LEFT JOIN questions q
        ON qqn.question_id = q.id
      WHERE qqn.quiz_id = $1
        AND qqn.note_text ILIKE $2
    `

    const unionSelect = `
      UNION ALL
      SELECT
        kbn.id::text AS id,
        NULL::integer AS question_id,
        kbn.content AS note_text,
        kbn.created_at,
        NULL::integer AS checkpoint,
        kbn.title,
        kbn.source,
        kbn.tags
      FROM knowledge_base_notes kbn
      WHERE kbn.quiz_id = $1
        AND (
          kbn.content ILIKE $2
          OR COALESCE(kbn.title, '') ILIKE $2
          OR EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(kbn.tags) AS t(tag)
            WHERE t.tag ILIKE $2
          )
        )
    `

    const notesQuery = `
      ${baseSelect}
      ${hasKnowledgeBaseNotes ? unionSelect : ''}
      ORDER BY created_at DESC
      LIMIT 20
    `

    const notesResult = await client.query(notesQuery, [quizId, `%${query}%`])
    const interviewsResult = await client.query(
      `
      SELECT
        ('interview-' || i.id::text) AS id,
        i.id AS interview_id,
        i.name AS interview_name,
        i.respondent_info,
        i.started_at,
        i.finished_at,
        COALESCE(
          string_agg(
            CONCAT_WS(E'\\n', NULLIF(ee.notes, ''), NULLIF(ee.evidence_log, '')),
            E'\\n\\n'
            ORDER BY ee.created_at DESC
          ),
          ''
        ) AS interview_text
      FROM interviews i
      LEFT JOIN evidence_entries ee
        ON ee.interview_id = i.id
      WHERE i.quiz_id = $1
      GROUP BY i.id
      HAVING (
        COALESCE(i.name, '') ILIKE $2
        OR COALESCE(i.respondent_info, '') ILIKE $2
        OR COALESCE(
          string_agg(
            CONCAT_WS(E'\\n', NULLIF(ee.notes, ''), NULLIF(ee.evidence_log, '')),
            E'\\n\\n'
          ),
          ''
        ) ILIKE $2
      )
      ORDER BY i.started_at DESC
      LIMIT 20
      `,
      [quizId, `%${query}%`]
    )
    const crmResult = await client.query(
      `
      SELECT
        ('crm-activity-' || la.id::text) AS id,
        la.id AS activity_id,
        la.lead_id,
        la.type,
        la.text,
        la.created_at,
        l.name AS lead_name,
        l.company AS lead_company
      FROM lead_activities la
      LEFT JOIN leads l
        ON l.id = la.lead_id
      WHERE la.quiz_id = $1
        AND (
          COALESCE(la.text, '') ILIKE $2
          OR COALESCE(la.type, '') ILIKE $2
          OR COALESCE(l.name, '') ILIKE $2
          OR COALESCE(l.company, '') ILIKE $2
        )
      ORDER BY la.created_at DESC
      LIMIT 20
      `,
      [quizId, `%${query}%`]
    )

    const interviewItems = interviewsResult.rows.map((row) => {
      const interviewBody = row.interview_text || ''
      const respondentLine = row.respondent_info ? `Respondent: ${row.respondent_info}` : ''
      const content = [respondentLine, interviewBody].filter(Boolean).join('\n\n').trim()
      const createdAt = row.finished_at || row.started_at

      return {
        id: row.id,
        interview_id: row.interview_id,
        title: row.interview_name || 'Interview',
        question_id: null,
        checkpoint: 'Interview',
        content,
        snippet: content.slice(0, 180),
        date: createdAt,
        created_at: createdAt,
        type: 'Interviews',
        tags: [],
        source: 'interview'
      }
    })

    const noteItems = notesResult.rows.map((row) => {
      const createdAt = row.created_at

      return {
        id: row.id,
        title:
          row.source === 'question_note' && row.question_id
            ? row.title || `Question ${row.question_id}`
            : row.title || '',
        question_id: row.question_id,
        checkpoint: row.checkpoint ? `Checkpoint ${row.checkpoint}` : 'Quick Capture',
        content: row.note_text,
        snippet: row.note_text.slice(0, 180),
        date: createdAt,
        created_at: createdAt,
        type: 'Notes',
        tags: row.tags || [],
        source: row.source
      }
    })
    const crmItems = crmResult.rows.map((row) => {
      const leadLabel = row.lead_name || row.lead_company || `Lead #${row.lead_id}`
      const typeLabel = row.type ? String(row.type).replaceAll('_', ' ') : 'activity'
      const title = `${leadLabel} - ${typeLabel}`
      const content = row.text || ''
      const createdAt = row.created_at

      return {
        id: row.id,
        lead_id: row.lead_id,
        activity_id: row.activity_id,
        title,
        question_id: null,
        checkpoint: 'CRM',
        content,
        snippet: content.slice(0, 180),
        date: createdAt,
        created_at: createdAt,
        type: 'CRM',
        tags: [],
        source: 'lead_activity'
      }
    })

    return {
      results: [
        {
          category: 'Notes',
          items: noteItems
        },
        {
          category: 'Interviews',
          items: interviewItems
        },
        {
          category: 'crm',
          items: crmItems
        }
      ]
    }
  } catch (error) {
    console.error('Search failed:', error)

    return {
      results: []
    }
  } finally {
    if (client) client.release()
  }
})
