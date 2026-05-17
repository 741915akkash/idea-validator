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

    const { rows } = await client.query(
      `
      SELECT
        qqn.quiz_id,
        qqn.question_id,
        qqn.note_text,
        qqn.created_at,
        qqn.updated_at,
        q.checkpoint
      FROM quiz_question_notes qqn
      LEFT JOIN questions q
        ON qqn.question_id = q.id
      WHERE qqn.quiz_id = $1
      ORDER BY qqn.created_at DESC
      `,
      [quizId]
    )

    return {
      success: true,
      notes: rows
    }
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
