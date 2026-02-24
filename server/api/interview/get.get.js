import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const { interview_id } = getQuery(event)

  const goalsRes = await pool.query(`SELECT * FROM interview_goals WHERE interview_id = $1`, [
    interview_id
  ])

  const conditionsRes = await pool.query(
    `
    SELECT c.*
    FROM interview_conditions c
    JOIN interview_goals g ON g.id = c.goal_id
    WHERE g.interview_id = $1
    `,
    [interview_id]
  )

  const questionsRes = await pool.query(
    `
    SELECT q.*
    FROM interview_questions q
    JOIN interview_goals g ON g.id = q.goal_id
    WHERE g.interview_id = $1
    `,
    [interview_id]
  )

  return {
    goals: goalsRes.rows,
    conditions: conditionsRes.rows,
    questions: questionsRes.rows
  }
})
