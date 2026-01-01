import { getQuery, createError, eventHandler } from 'h3'
import { pool } from '../../db'

export default eventHandler(async (event) => {
  const { quiz_id, checkpoint } = getQuery(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id is required'
    })
  }

  const client = await pool.connect()

  try {
    // 1️⃣ Always fetch quiz lifecycle state
    const quizRes = await client.query(
      `
      SELECT status
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

    const quizStatus = quizRes.rows[0].status

    // ─────────────────────────────────────────────
    // MODE 1 — lifecycle only (no checkpoint)
    // ─────────────────────────────────────────────
    if (!checkpoint) {
      const cpRes = await client.query(
        `
        SELECT checkpoint
        FROM quiz_state
        WHERE quiz_id = $1
        `,
        [quiz_id]
      )

      return {
        status: quizStatus,
        current_checkpoint: cpRes.rows[0]?.checkpoint ?? 1
      }
    }

    // ─────────────────────────────────────────────
    // MODE 2 — checkpoint questions (NEW)
    // ─────────────────────────────────────────────
    const questionsRes = await client.query(
      `
      SELECT
        q.id,
        q.question_text,
        q.option_map,
        a.selected_option
      FROM questions q
      LEFT JOIN answers a
        ON a.question_id = q.id
       AND a.quiz_id = $1
      WHERE q.checkpoint = $2
      ORDER BY q.question_order ASC
      `,
      [quiz_id, checkpoint]
    )

    return {
      status: quizStatus,
      checkpoint: Number(checkpoint),
      questions: questionsRes.rows.map((row) => ({
        id: row.id,
        question_text: row.question_text,
        option_map: row.option_map,
        selected_option: row.selected_option
      }))
    }
  } finally {
    client.release()
  }
})
