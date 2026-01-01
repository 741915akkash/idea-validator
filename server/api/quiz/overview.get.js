import { getQuery, createError, eventHandler } from 'h3'
import { pool } from '../../db' // adjust if your db import differs

export default eventHandler(async (event) => {
  const { quiz_id } = getQuery(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id is required'
    })
  }

  const client = await pool.connect()

  try {
    // 1️⃣ Fetch quiz status
    const quizRes = await client.query(
      `
      SELECT id, status
      FROM quizzes
      WHERE id = $1
      `,
      [quiz_id]
    )

    if (quizRes.rowCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Quiz not found'
      })
    }

    const quiz = quizRes.rows[0]

    // 2️⃣ Aggregate checkpoint overview
    const checkpointsRes = await client.query(
      `
            SELECT
        q.checkpoint,
        COUNT(q.id) AS total_questions,
        COUNT(q.id) FILTER (
          WHERE a.id IS NULL OR a.selected_option IS NULL
        ) AS unanswered_questions
      FROM questions q
      LEFT JOIN answers a
        ON a.question_id = q.id
      AND a.quiz_id = $1
      GROUP BY q.checkpoint
      ORDER BY q.checkpoint ASC;
      `,
      [quiz_id]
    )

    return {
      quiz_id: quiz.id,
      is_completed: quiz.status === 'COMPLETED',
      checkpoints: checkpointsRes.rows.map((row) => ({
        checkpoint: Number(row.checkpoint),
        total_questions: Number(row.total_questions),
        unanswered_questions: Number(row.unanswered_questions)
      }))
    }
  } finally {
    client.release()
  }
})
