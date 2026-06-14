import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

const DEFAULT_PIPELINE_NAME = 'Sales Pipeline'

const DEFAULT_STAGES = ['New Lead', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won']

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  const existingPipeline = await pool.query(
    `
    SELECT id
    FROM pipelines
    WHERE user_id = $1
    LIMIT 1
    `,
    [userId]
  )

  if (existingPipeline.rows.length) {
    return {
      success: true,
      skipped: true,
      message: 'User already has pipelines'
    }
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const pipelineResult = await client.query(
      `
      INSERT INTO pipelines (
        user_id,
        name
      )
      VALUES ($1, $2)
      RETURNING *
      `,
      [userId, DEFAULT_PIPELINE_NAME]
    )

    const pipeline = pipelineResult.rows[0]

    for (let i = 0; i < DEFAULT_STAGES.length; i++) {
      await client.query(
        `
        INSERT INTO pipeline_stages (
          pipeline_id,
          user_id,
          name,
          position
        )
        VALUES ($1, $2, $3, $4)
        `,
        [pipeline.id, userId, DEFAULT_STAGES[i], i + 1]
      )
    }

    await client.query('COMMIT')

    return {
      success: true,
      pipeline
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
