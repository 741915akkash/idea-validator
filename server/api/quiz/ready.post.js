import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const { quiz_id } = await readBody(event)

  const { rowCount } = await pool.query(
    `
    UPDATE quizzes
    SET status = 'READY_TO_SCORE'
    WHERE id = $1
      AND status = 'IN_PROGRESS'
    `,
    [quiz_id]
  )

  if (!rowCount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Quiz not in progress or already finalized'
    })
  }

  return { ok: true }
})
