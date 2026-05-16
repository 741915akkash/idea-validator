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

    const notesQuery = `
      SELECT
        question_id,
        note_text,
        created_at
      FROM quiz_question_notes
      WHERE quiz_id = $1
      AND note_text ILIKE $2
      ORDER BY created_at DESC
      LIMIT 20
    `

    const notesResult = await client.query(notesQuery, [quizId, `%${query}%`])

    return {
      results: [
        {
          category: 'Notes',
          items: notesResult.rows.map((row) => ({
            id: row.question_id,
            question_id: row.question_id,
            title: `Question ${row.question_id}`,
            checkpoint: `Question ${row.question_id}`,
            content: row.note_text,
            snippet: row.note_text.slice(0, 180),
            date: row.created_at
          }))
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
