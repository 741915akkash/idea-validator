import { pool } from '../../db'
import { requireQuizAccess } from '../../utils/quizAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { sub_uncertainty_id, quiz_id } = body

  if (!sub_uncertainty_id || !quiz_id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await requireQuizAccess(client, event, quiz_id)

    // 1️⃣ Create interview execution row
    const interviewRes = await client.query(
      `
      INSERT INTO interviews (quiz_id, sub_uncertainty_id, status)
      VALUES ($1, $2, 'active')
      RETURNING id
      `,
      [quiz_id, sub_uncertainty_id]
    )

    const interviewId = interviewRes.rows[0].id

    // 2️⃣ Get goal for sub
    const goalRes = await client.query(
      `
      SELECT id FROM goals
      WHERE sub_uncertainty_id = $1
      `,
      [sub_uncertainty_id]
    )

    if (goalRes.rows.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Goal not found for sub' })
    }

    const goalId = goalRes.rows[0].id

    // 3️⃣ Get all conditions (template)
    const conditionsRes = await client.query(
      `
      SELECT id FROM conditions
      WHERE goal_id = $1
      ORDER BY order_index ASC
      `,
      [goalId]
    )

    // 4️⃣ Create condition_results (runtime state)
    for (const row of conditionsRes.rows) {
      await client.query(
        `
        INSERT INTO condition_results (interview_id, condition_id, status)
        VALUES ($1, $2, 'pending')
        `,
        [interviewId, row.id]
      )
    }

    await client.query('COMMIT')

    return { interview_id: interviewId }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})
