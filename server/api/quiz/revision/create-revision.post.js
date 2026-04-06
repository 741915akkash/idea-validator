import { pool } from '../../../db'
import { createError } from 'h3'
import { requireQuizAccess } from '../../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const { quiz_id } = await readBody(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id is required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1️⃣ Fetch quiz
    const quiz = await requireQuizAccess(client, event, quiz_id, { select: '*' })

    if (quiz.status !== 'COMPLETED') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Quiz must be completed to start a revision'
      })
    }

    // 2️⃣ Determine parent + next revision number
    const parentQuizId = quiz.parent_quiz_id ?? quiz.id

    const revRes = await client.query(
      `
      SELECT COALESCE(MAX(revision_number), 0) AS max
      FROM quizzes
      WHERE parent_quiz_id = $1 OR id = $1
      `,
      [parentQuizId]
    )

    const revisionNumber = Number(revRes.rows[0].max) + 1

    // 3️⃣ Create new quiz (name stays clean)
    const insertRes = await client.query(
      `
      INSERT INTO quizzes (
        user_id,
        status,
        parent_quiz_id,
        revision_number,
        name,
        started_at
      )
      VALUES ($1, 'IN_PROGRESS', $2, $3, $4, now())
      RETURNING id
      `,
      [quiz.user_id, parentQuizId, revisionNumber, quiz.name]
    )

    const newQuizId = insertRes.rows[0].id

    // 3.1 Initialize lifecycle tables for the new revision quiz.
    await client.query(
      `
      INSERT INTO quiz_state (quiz_id)
      VALUES ($1)
      `,
      [newQuizId]
    )

    await client.query(
      `
      INSERT INTO quiz_checkpoints (quiz_id, checkpoint)
      SELECT $1, checkpoint
      FROM (
        SELECT DISTINCT checkpoint
        FROM questions
      ) q
      `,
      [newQuizId]
    )

    // 4️⃣ Copy answers
    await client.query(
      `
      INSERT INTO answers (quiz_id, question_id, selected_option)
      SELECT $1, question_id, selected_option
      FROM answers
      WHERE quiz_id = $2
      `,
      [newQuizId, quiz_id]
    )

    // 5️⃣ Copy ASQ answers (FIXED)
    await client.query(
      `
  INSERT INTO quiz_asq_answers (
    quiz_id,
    question_id,
    asq_id,
    answer_value,
    answered_at
  )
  SELECT
    $1,
    question_id,
    asq_id,
    answer_value,
    answered_at
  FROM quiz_asq_answers
  WHERE quiz_id = $2
  ON CONFLICT (quiz_id, asq_id) DO NOTHING
  `,
      [newQuizId, quiz_id]
    )

    // 6️⃣ Copy question notes (FIXED)
    await client.query(
      `
  INSERT INTO quiz_question_notes (
    quiz_id,
    question_id,
    note_text,
    created_at,
    updated_at
  )
  SELECT
    $1,
    question_id,
    note_text,
    created_at,
    updated_at
  FROM quiz_question_notes
  WHERE quiz_id = $2
  ON CONFLICT (quiz_id, question_id) DO NOTHING
  `,
      [newQuizId, quiz_id]
    )

    await client.query('COMMIT')

    return { quiz_id: newQuizId }
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('CREATE REVISION ERROR:', err) // 👈 ADD THIS
    throw err
  } finally {
    client.release()
  }
})
