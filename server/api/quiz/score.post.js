import { pool } from '../../db'
import { calculateScores } from '../../services/scoring'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { quiz_id } = await readBody(event)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1️⃣ Fetch quiz
    const quizRes = await client.query(
      `
      SELECT id, status, parent_quiz_id, revision_number
      FROM quizzes
      WHERE id = $1
      `,
      [quiz_id]
    )

    if (!quizRes.rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'Quiz not found' })
    }

    const quiz = quizRes.rows[0]

    if (quiz.status !== 'IN_PROGRESS') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Quiz cannot be scored in its current state'
      })
    }

    // 2️⃣ Prevent double scoring
    const existing = await client.query(`SELECT 1 FROM quiz_results WHERE quiz_id = $1`, [quiz_id])

    if (existing.rows.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Quiz already scored'
      })
    }

    // 3️⃣ Ensure all questions answered (authoritative)
    // 3️⃣ Ensure all questions are answered (authoritative)
    const unanswered = await client.query(
      `
        SELECT 1
        FROM questions q
        LEFT JOIN answers a
          ON a.question_id = q.id
        AND a.quiz_id = $1
        WHERE a.question_id IS NULL
        LIMIT 1
        `,
      [quiz_id]
    )

    if (unanswered.rows.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Answer all questions before scoring'
      })
    }

    if (unanswered.rows.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Answer all questions before scoring'
      })
    }

    // 4️⃣ 🔒 Revision diff check (SAFE, SET-BASED)
    if (quiz.revision_number > 0) {
      let prevQuizId

      if (quiz.revision_number === 1) {
        // 🔒 First revision compares against the original quiz
        prevQuizId = quiz.parent_quiz_id
      } else {
        // 🔒 Subsequent revisions compare against previous revision
        const prevRes = await client.query(
          `
      SELECT id
      FROM quizzes
      WHERE parent_quiz_id = $1
        AND revision_number = $2
    `,
          [quiz.parent_quiz_id, quiz.revision_number - 1]
        )

        prevQuizId = prevRes.rows[0]?.id
      }

      if (!prevQuizId) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Previous revision missing'
        })
      }

      const diffRes = await client.query(
        `
        (
          SELECT question_id, selected_option
          FROM answers
          WHERE quiz_id = $1
        )
        EXCEPT
        (
          SELECT question_id, selected_option
          FROM answers
          WHERE quiz_id = $2
        )
        LIMIT 1
        `,
        [quiz_id, prevQuizId]
      )

      if (!diffRes.rows.length) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Score is identical to previous revision. Change at least one option to get a new score.'
        })
      }
    }

    // 5️⃣ Calculate scores
    const result = await calculateScores(client, quiz_id)

    // 6️⃣ Persist immutable snapshot
    const summary = {
      market_decision: result.decision,
      market_breakdown: result.summary.market_breakdown,
      confidence_breakdown: result.summary.confidence_breakdown,
      locked: true
    }

    await client.query(
      `
      INSERT INTO quiz_results
        (quiz_id, market_score, confidence_score, decision, summary)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [quiz_id, result.marketScore, result.confidenceScore, result.decision, summary]
    )

    // 7️⃣ Lock quiz
    await client.query(
      `
      UPDATE quizzes
      SET status = 'COMPLETED',
          completed_at = now()
      WHERE id = $1
      `,
      [quiz_id]
    )

    await client.query('COMMIT')

    return {
      market_score: result.marketScore,
      confidence_score: result.confidenceScore,
      decision: result.decision,
      summary
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
})
