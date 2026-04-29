import { eventHandler, readBody, createError } from 'h3'
import { pool } from '../../db'
import { requireQuizAccess, requireUserIdentity } from '../../utils/quizAccess'

export default eventHandler(async (event) => {
  const { quiz_id, confirm_name } = await readBody(event)
  const { userId } = requireUserIdentity(event)

  if (!quiz_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'quiz_id required'
    })
  }

  if (!confirm_name || !String(confirm_name).trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'confirm_name required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const selectedQuiz = await requireQuizAccess(client, event, quiz_id, {
      select: 'id, name, parent_quiz_id'
    })

    const rootQuizId = selectedQuiz.parent_quiz_id || selectedQuiz.id

    const familyRes = await client.query(
      `
      SELECT id, name, parent_quiz_id, revision_number
      FROM quizzes
      WHERE user_id = $1
        AND (id = $2 OR parent_quiz_id = $2)
      ORDER BY revision_number ASC, started_at ASC NULLS LAST
      `,
      [userId, rootQuizId]
    )

    if (!familyRes.rowCount) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Idea not found'
      })
    }

    const rootQuiz = familyRes.rows.find((q) => q.id === rootQuizId) || familyRes.rows[0]
    const expectedName = String(rootQuiz?.name || 'Untitled idea').trim()
    const providedName = String(confirm_name).trim()

    if (providedName !== expectedName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Idea name does not match'
      })
    }

    const familyQuizIds = familyRes.rows.map((q) => q.id)

    const nextQuizRes = await client.query(
      `
      SELECT id
      FROM quizzes
      WHERE user_id = $1
        AND archived_at IS NULL
        AND id <> ALL($2::uuid[])
      ORDER BY COALESCE(parent_quiz_id, id), revision_number
      LIMIT 1
      `,
      [userId, familyQuizIds]
    )

    const nextQuizId = nextQuizRes.rows[0]?.id || null

    await client.query(
      `
      UPDATE users
      SET current_quiz_id = $1
      WHERE id = $2
      `,
      [nextQuizId, userId]
    )

    await client.query(
      `
      DELETE FROM interviews
      WHERE quiz_id = ANY($1::uuid[])
      `,
      [familyQuizIds]
    )

    await client.query(
      `
      DELETE FROM quiz_question_notes
      WHERE quiz_id = ANY($1::uuid[])
      `,
      [familyQuizIds]
    )

    await client.query(
      `
      DELETE FROM answers
      WHERE quiz_id = ANY($1::uuid[])
      `,
      [familyQuizIds]
    )

    await client.query(
      `
      DELETE FROM quiz_checkpoints
      WHERE quiz_id = ANY($1::uuid[])
      `,
      [familyQuizIds]
    )

    await client.query(
      `
      DELETE FROM quiz_results
      WHERE quiz_id = ANY($1::uuid[])
      `,
      [familyQuizIds]
    )

    await client.query(
      `
      DELETE FROM quiz_state
      WHERE quiz_id = ANY($1::uuid[])
      `,
      [familyQuizIds]
    )

    await client.query(
      `
      DELETE FROM quizzes
      WHERE parent_quiz_id = $1
      `,
      [rootQuizId]
    )

    await client.query(
      `
      DELETE FROM quizzes
      WHERE id = $1
      `,
      [rootQuizId]
    )

    await client.query('COMMIT')

    return {
      success: true,
      next_quiz_id: nextQuizId,
      deleted_quiz_ids: familyQuizIds
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})

