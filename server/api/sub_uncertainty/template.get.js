import { pool } from '../../db'
import { requireSubUncertaintyAccess } from '../../utils/subUncertaintyAccess'

export default defineEventHandler(async (event) => {
  const { sub_uncertainty_id } = getQuery(event)

  if (!sub_uncertainty_id) {
    throw createError({ statusCode: 400, statusMessage: 'sub_uncertainty_id required' })
  }

  const client = await pool.connect()

  try {
    const sub = await requireSubUncertaintyAccess(client, event, sub_uncertainty_id, {
      select: 's.id, s.uncertainty_id, s.title'
    })

    const goalRes = await client.query(
      `
      SELECT id, statement
      FROM goals
      WHERE sub_uncertainty_id = $1
      LIMIT 1
      `,
      [sub.id]
    )

    let goal = goalRes.rows[0] || null

    if (!goal) {
      const insertedGoalRes = await client.query(
        `
        INSERT INTO goals (sub_uncertainty_id, statement)
        VALUES ($1, $2)
        RETURNING id, statement
        `,
        [sub.id, sub.title]
      )

      goal = insertedGoalRes.rows[0]

      return {
        sub_uncertainty: sub,
        goal,
        conditions: [],
        questions: []
      }
    }

    const conditionsRes = await client.query(
      `
      SELECT *
      FROM conditions
      WHERE goal_id = $1
      ORDER BY order_index ASC
      `,
      [goal.id]
    )

    const questionsRes = await client.query(
      `
      SELECT *
      FROM interview_questions
      WHERE goal_id = $1
      ORDER BY order_index ASC
      `,
      [goal.id]
    )

    return {
      sub_uncertainty: sub,
      goal,
      conditions: conditionsRes.rows,
      questions: questionsRes.rows
    }
  } finally {
    client.release()
  }
})
