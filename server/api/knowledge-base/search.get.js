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
        qqn.question_id,
        qqn.note_text,
        qqn.created_at,
        q.checkpoint
      FROM quiz_question_notes qqn
      LEFT JOIN questions q
        ON qqn.question_id = q.id
      WHERE qqn.quiz_id = $1
      AND qqn.note_text ILIKE $2
      ORDER BY qqn.created_at DESC
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
            checkpoint: `Checkpoint ${row.checkpoint}`,
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