import { pool } from '../../db/index.js'

import { approveArtifact } from '../../services/artifact-reviews/approve-artifact.js'

export default defineEventHandler(async (event) => {
  const { artifactId } = event.context.params

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await approveArtifact({
      client,
      artifactId,
      reviewedBy: null // TODO: Replace with authenticated user ID
    })

    await client.query('COMMIT')

    return {
      success: true
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
