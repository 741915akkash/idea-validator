import { pool } from '../../db/index.js'

import { improveArtifact } from '../../services/artifact-reviews/improve-artifact.js'

export default defineEventHandler(async (event) => {
  const { artifactId } = event.context.params

  const body = await readBody(event)

  if (!body.feedback?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'feedback is required'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await improveArtifact({
      client,
      artifactId,
      feedback: body.feedback,
      reviewedBy: null
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
