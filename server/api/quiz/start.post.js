import { getQuery, eventHandler } from 'h3'
import { pool } from '../../db'

export default eventHandler(async (event) => {
  const { force } = getQuery(event)
  const forceNew = force === 'true'

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1️⃣ Get or create SINGLE user (temporary: no auth)
    const userRes = await client.query(`
      SELECT id
      FROM users
      ORDER BY created_at ASC
      LIMIT 1
    `)

    let userId

    if (userRes.rowCount > 0) {
      userId = userRes.rows[0].id
    } else {
      const createdUser = await client.query(`INSERT INTO users DEFAULT VALUES RETURNING id`)
      userId = createdUser.rows[0].id
    }

    // 2️⃣ Find existing active quiz
    const existingQuizRes = await client.query(
      `
      SELECT id
      FROM quizzes
      WHERE user_id = $1
        AND status IN ('NOT_STARTED', 'IN_PROGRESS')
      ORDER BY started_at DESC NULLS LAST
      LIMIT 1
      `,
      [userId]
    )

    let quizId
    let isNewQuiz = false

    // 3️⃣ Decide reuse vs create
    if (!forceNew && existingQuizRes.rowCount > 0) {
      quizId = existingQuizRes.rows[0].id
    } else {
      const quizRes = await client.query(
        `
        INSERT INTO quizzes (user_id, status, started_at)
        VALUES ($1, 'IN_PROGRESS', now())
        RETURNING id
        `,
        [userId]
      )

      quizId = quizRes.rows[0].id
      isNewQuiz = true

      // initialize quiz_state
      await client.query(`INSERT INTO quiz_state (quiz_id) VALUES ($1)`, [quizId])

      // initialize quiz_checkpoints
      await client.query(
        `
        INSERT INTO quiz_checkpoints (quiz_id, checkpoint)
        SELECT $1, checkpoint
        FROM (
          SELECT DISTINCT checkpoint FROM questions
        ) q
        `,
        [quizId]
      )
    }

    // 4️⃣ Set as current quiz (important for future)
    await client.query(
      `
      UPDATE users
      SET current_quiz_id = $1
      WHERE id = $2
      `,
      [quizId, userId]
    )

    await client.query('COMMIT')

    return {
      quiz_id: quizId,
      is_new: isNewQuiz
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
})
