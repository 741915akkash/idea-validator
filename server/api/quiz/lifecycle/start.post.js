import { getQuery, eventHandler, createError } from 'h3'
import { pool } from '../../../db'

export default eventHandler(async (event) => {
  const { force } = getQuery(event)
  const forceNew = force === 'true'
  const authUserId = event.context?.user?.id || event.context?.auth?.userId || null
  const visitorId = event.context?.visitorId || null

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    let userId = authUserId

    if (!userId && !visitorId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing identity: expected logged-in user or visitor_id'
      })
    }

    // 2️⃣ Find existing quiz
    let existingQuizRes
    if (userId) {
      existingQuizRes = await client.query(
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
    } else {
      existingQuizRes = await client.query(
        `
        SELECT id
        FROM quizzes
        WHERE visitor_id = $1
        ORDER BY started_at DESC NULLS LAST
        LIMIT 1
        `,
        [visitorId]
      )
    }

    let quizId
    let isNewQuiz = false

    // 3️⃣ Decide reuse vs create
    // Visitors are strictly single-quiz: always reuse if present.
    const shouldReuseExisting = userId ? !forceNew : true
    if (shouldReuseExisting && existingQuizRes.rowCount > 0) {
      quizId = existingQuizRes.rows[0].id
    } else {
      let quizRes
      if (userId) {
        quizRes = await client.query(
          `
          INSERT INTO quizzes (user_id, status, started_at)
          VALUES ($1, 'IN_PROGRESS', now())
          RETURNING id
          `,
          [userId]
        )
      } else {
        try {
          quizRes = await client.query(
            `
            INSERT INTO quizzes (visitor_id, status, started_at)
            VALUES ($1, 'IN_PROGRESS', now())
            RETURNING id
            `,
            [visitorId]
          )
        } catch (error) {
          // Handle race on unique(visitor_id) by reusing created quiz.
          if (error?.code === '23505') {
            const retryExisting = await client.query(
              `
              SELECT id
              FROM quizzes
              WHERE visitor_id = $1
              ORDER BY started_at DESC NULLS LAST
              LIMIT 1
              `,
              [visitorId]
            )

            if (!retryExisting.rowCount) {
              throw error
            }

            quizId = retryExisting.rows[0].id
            await client.query('COMMIT')
            return {
              quiz_id: quizId,
              is_new: false
            }
          }
          throw error
        }
      }

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

    // 4️⃣ Set as current quiz for logged-in users
    if (userId) {
      await client.query(
        `
        UPDATE users
        SET current_quiz_id = $1
        WHERE id = $2
        `,
        [quizId, userId]
      )
    }

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
// postgresql://postgres.hanmufojbcpihqbzmdht:0fdwNSrKCBK011oP@aws-1-us-east-1.pooler.supabase.com:5432/postgres