import { pool } from '../../../db/index.js'
import { requireCrmEnabled } from '../../../utils/crm/crmAccess.js'

const DEFAULT_STAGES = [
  { name: 'New Lead', position: 1 },
  { name: 'Qualified', position: 2 },
  { name: 'Proposal Sent', position: 3 },
  { name: 'Negotiation', position: 4 },
  { name: 'Closed Won', position: 5 }
]

async function createDefaultStages(userId) {
  const values = []
  const placeholders = []

  DEFAULT_STAGES.forEach((stage, index) => {
    const offset = index * 3

    placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`)

    values.push(stage.name, stage.position, userId)
  })

  await pool.query(
    `
    INSERT INTO pipeline_stages (name, position, user_id)
    VALUES ${placeholders.join(', ')}
    ON CONFLICT DO NOTHING
    `,
    values
  )
}

async function getStages(userId) {
  const result = await pool.query(
    `
    SELECT *
    FROM pipeline_stages
    WHERE user_id = $1
    ORDER BY position ASC
    `,
    [userId]
  )

  return result.rows
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireCrmEnabled(event)

  let stages = await getStages(userId)

  if (!stages.length) {
    await createDefaultStages(userId)
    stages = await getStages(userId)
  }

  return stages
})
