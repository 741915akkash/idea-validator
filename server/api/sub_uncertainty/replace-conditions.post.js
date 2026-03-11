// server/api/sub/replace-conditions.post.js

import { pool } from '../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { goal_id, conditions } = body

  if (!goal_id || !Array.isArray(conditions)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'goal_id and conditions required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1️⃣ Ensure goal exists
    const goalCheck = await client.query(`SELECT id FROM goals WHERE id = $1`, [goal_id])

    if (goalCheck.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Goal not found'
      })
    }

    // 2️⃣ Delete existing conditions (interview_questions cascade delete)
    await client.query(`DELETE FROM conditions WHERE goal_id = $1`, [goal_id])

    // 3️⃣ Insert new conditions + interview questions
    let orderIndex = 0

    for (const cond of conditions) {
      if (!cond.description?.trim()) continue

      const condRes = await client.query(
        `
        INSERT INTO conditions (goal_id, description, order_index)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [goal_id, cond.description.trim(), orderIndex++]
      )

      const conditionId = condRes.rows[0].id

      let questionIndex = 0

      if (Array.isArray(cond.questions)) {
        for (const q of cond.questions) {
          if (!q?.trim()) continue

          await client.query(
            `
            INSERT INTO interview_questions (goal_id, condition_id, text, order_index)
            VALUES ($1, $2, $3, $4)
            `,
            [goal_id, conditionId, q.trim(), questionIndex++]
          )
        }
      }
    }

    await client.query('COMMIT')

    return { ok: true }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})
