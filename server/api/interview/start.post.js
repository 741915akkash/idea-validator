import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { quiz_id, goal, structured } = body

  if (!quiz_id || !goal || !structured) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const interviewRes = await client.query(
      `
      INSERT INTO interviews (quiz_id)
      VALUES ($1)
      RETURNING id
      `,
      [quiz_id]
    )

    const interviewId = interviewRes.rows[0].id

    const goalRes = await client.query(
      `
      INSERT INTO interview_goals (interview_id, text)
      VALUES ($1, $2)
      RETURNING id
      `,
      [interviewId, goal]
    )

    const goalId = goalRes.rows[0].id

    for (const cond of structured.conditions) {
      const condRes = await client.query(
        `
        INSERT INTO interview_conditions (goal_id, text)
        VALUES ($1, $2)
        RETURNING id
        `,
        [goalId, cond.text]
      )

      const conditionId = condRes.rows[0].id

      for (const q of cond.questions) {
        await client.query(
          `
          INSERT INTO interview_questions (goal_id, text)
          VALUES ($1, $2)
          `,
          [goalId, q]
        )
      }
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
