import { eventHandler, getQuery, createError } from 'h3'
import { pool } from '../../db/index.js'

export default eventHandler(async (event) => {
  let client

  try {
    const { quizId } = getQuery(event)

    if (!quizId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'quizId is required'
      })
    }

    client = await pool.connect()

    const questionNotesPromise = client.query(
      `
      SELECT
        (qqn.quiz_id::text || '-' || qqn.question_id::text) AS id,
        qqn.quiz_id,
        qqn.question_id,
        q.checkpoint,
        NULL::text AS title,
        qqn.note_text AS content,
        'question_note' AS source,
        qqn.created_at,
        qqn.updated_at
      FROM quiz_question_notes qqn
      LEFT JOIN questions q
        ON qqn.question_id = q.id
      WHERE qqn.quiz_id = $1
      ORDER BY qqn.created_at DESC
  `,
      [quizId]
    )

    const knowledgeBasePromise = client.query(
      `
      SELECT
        id::text,
        quiz_id,
        NULL::integer AS question_id,
        NULL::text AS checkpoint,
        title,
        content,
        source,
        created_at,
        updated_at
      FROM knowledge_base_notes
      WHERE quiz_id = $1
      ORDER BY created_at DESC
  `,
      [quizId]
    )

    const [questionNotesResult, knowledgeBaseResult] = await Promise.all([
      questionNotesPromise,
      knowledgeBasePromise
    ])

    return [...questionNotesResult.rows, ...knowledgeBaseResult.rows]
  } catch (error) {
    console.error('Failed to fetch notes:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch notes'
    })
  } finally {
    if (client) client.release()
  }
})
