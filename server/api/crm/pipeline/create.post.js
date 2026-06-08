import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

const DEFAULT_STAGES = ['New Lead', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won']

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)
  const body = await readBody(event)

  const name = String(body?.name || '').trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pipeline name is required'
    })
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
      [userId, name]
    )

    const pipeline = pipelineResult.rows[0]

    for (let i = 0; i < DEFAULT_STAGES.length; i++) {
      await client.query(
        `
        INSERT INTO pipeline_stages (
          pipeline_id,
          name,
          position,
          user_id
        )
        VALUES ($1, $2, $3, $4)
        `,
        [pipeline.id, DEFAULT_STAGES[i], i + 1, userId]
      )
    }

    await client.query('COMMIT')

    return pipeline
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
