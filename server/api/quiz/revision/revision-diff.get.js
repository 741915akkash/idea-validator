import { pool } from '../../../db'
import { getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { quiz_id } = getQuery(event)
  if (!quiz_id) {
    throw createError({ statusCode: 400, statusMessage: 'quiz_id required' })
  }

  const client = await pool.connect()

  try {
    // 1️⃣ Fetch quiz + revision info
    const quizRes = await client.query(
      `
      SELECT id, parent_quiz_id, revision_number
      FROM quizzes
      WHERE id = $1
      `,
      [quiz_id]
    )

    if (!quizRes.rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'Quiz not found' })
    }

    const quiz = quizRes.rows[0]

    if (quiz.revision_number === 0) {
      return { changes: [] }
    }

    // 2️⃣ Get previous revision
    const prevRes = await client.query(
      `
      SELECT id
      FROM quizzes
      WHERE parent_quiz_id = $1
        AND revision_number = $2
      `,
      [quiz.parent_quiz_id, quiz.revision_number - 1]
    )

    const prevQuizId = prevRes.rows[0]?.id
    if (!prevQuizId) {
      return { changes: [] }
    }

    /**
     * 3️⃣ Find ALL changed questions
     * A question is "changed" if ANY of:
     * - main option differs
     * - any ASQ answer differs
     * - notes differ
     */
    const changedQuestionsRes = await client.query(
      `
      SELECT DISTINCT q.id AS question_id, q.checkpoint, q.question_text AS question_text
      FROM questions q
      WHERE
        -- main option changed
        EXISTS (
          SELECT 1
          FROM answers c
          JOIN answers p ON p.question_id = c.question_id
          WHERE c.quiz_id = $1
            AND p.quiz_id = $2
            AND c.question_id = q.id
            AND c.selected_option IS DISTINCT FROM p.selected_option
        )
        OR
        -- ASQ added or modified
        EXISTS (
          SELECT 1
          FROM quiz_asq_answers c
          LEFT JOIN quiz_asq_answers p
            ON p.quiz_id = $2
          AND p.asq_id = c.asq_id
          AND p.question_id = c.question_id
          WHERE c.quiz_id = $1
            AND c.question_id = q.id
            AND (
              p.quiz_id IS NULL
              OR c.answer_value IS DISTINCT FROM p.answer_value
            )
        )
        OR
        -- ASQ removed
        EXISTS (
          SELECT 1
          FROM quiz_asq_answers p
          LEFT JOIN quiz_asq_answers c
            ON c.quiz_id = $1
          AND c.asq_id = p.asq_id
          AND c.question_id = p.question_id
          WHERE p.quiz_id = $2
            AND p.question_id = q.id
            AND c.quiz_id IS NULL
        )
        OR
        -- note added or modified
        EXISTS (
          SELECT 1
          FROM quiz_question_notes c
          LEFT JOIN quiz_question_notes p
            ON p.quiz_id = $2
          AND p.question_id = c.question_id
          WHERE c.quiz_id = $1
            AND c.question_id = q.id
            AND c.note_text IS DISTINCT FROM p.note_text
        )
        OR
        -- note removed
        EXISTS (
          SELECT 1
          FROM quiz_question_notes p
          LEFT JOIN quiz_question_notes c
            ON c.quiz_id = $1
          AND c.question_id = p.question_id
          WHERE p.quiz_id = $2
            AND p.question_id = q.id
            AND c.quiz_id IS NULL
        )

      ORDER BY q.checkpoint, q.id
      `,
      [quiz_id, prevQuizId]
    )

    const questionIds = changedQuestionsRes.rows.map((r) => r.question_id)
    if (!questionIds.length) {
      return { changes: [] }
    }

    // 4️⃣ Main options (prev + curr)
    const optionsRes = await client.query(
      `
      SELECT quiz_id, question_id, selected_option
      FROM answers
      WHERE quiz_id IN ($1, $2)
        AND question_id = ANY($3)
      `,
      [quiz_id, prevQuizId, questionIds]
    )

    // 5️⃣ ASQs (prev + curr)
    const asqRes = await client.query(
      `
      SELECT
        qa.quiz_id,
        qa.question_id,
        aq.question_text AS asq_text,
        qa.answer_value
      FROM quiz_asq_answers qa
      JOIN asq_questions aq ON aq.id = qa.asq_id
      WHERE qa.quiz_id IN ($1, $2)
        AND qa.question_id = ANY($3)
      `,
      [quiz_id, prevQuizId, questionIds]
    )

    // 6️⃣ Notes (prev + curr)
    const notesRes = await client.query(
      `
      SELECT quiz_id, question_id, note_text
      FROM quiz_question_notes
      WHERE quiz_id IN ($1, $2)
        AND question_id = ANY($3)
      `,
      [quiz_id, prevQuizId, questionIds]
    )

    // 7️⃣ Shape response
    const changes = changedQuestionsRes.rows.map((q) => {
      const prevOption = optionsRes.rows.find(
        (r) => r.quiz_id === prevQuizId && r.question_id === q.question_id
      )?.selected_option

      const currOption = optionsRes.rows.find(
        (r) => r.quiz_id === quiz_id && r.question_id === q.question_id
      )?.selected_option

      return {
        question_id: q.question_id,
        checkpoint: q.checkpoint,
        question_text: q.question_text,

        main_option: {
          previous: prevOption ?? null,
          current: currOption ?? null
        },

        asqs: {
          previous: asqRes.rows
            .filter((r) => r.quiz_id === prevQuizId && r.question_id === q.question_id)
            .map((r) => ({ text: r.asq_text, value: r.answer_value })),
          current: asqRes.rows
            .filter((r) => r.quiz_id === quiz_id && r.question_id === q.question_id)
            .map((r) => ({ text: r.asq_text, value: r.answer_value }))
        },

        notes: {
          previous: notesRes.rows
            .filter((r) => r.quiz_id === prevQuizId && r.question_id === q.question_id)
            .map((r) => r.note_text),
          current: notesRes.rows
            .filter((r) => r.quiz_id === quiz_id && r.question_id === q.question_id)
            .map((r) => r.note_text)
        }
      }
    })

    return { changes }
  } finally {
    client.release()
  }
})
