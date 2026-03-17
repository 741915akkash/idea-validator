import { getQuery, createError, eventHandler } from 'h3'
import { pool } from '../../../db'
import { requireQuizAccess } from '../../../utils/quizAccess'

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
    const quiz = await requireQuizAccess(client, event, quiz_id, {
      select: 'status'
    })
    const quizStatus = quiz.status

    // ─────────────────────────────────────────────
    // MODE 1 — lifecycle only (no checkpoint)
    // ─────────────────────────────────────────────
    if (!checkpoint) {
      const cpRes = await client.query(
        `
        SELECT current_checkpoint
        FROM quiz_state
        WHERE quiz_id = $1
        `,
        [quiz_id]
      )

      return {
        status: quizStatus,
        current_checkpoint: cpRes.rows[0]?.current_checkpoint ?? 1
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
