import { pool } from '../../db/index.js'
import { loadReviews } from '../../services/artifact-reviews/load-reviews.js'

export default defineEventHandler(async (event) => {
  const { artifactId } = getQuery(event)

  if (!artifactId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'artifactId is required'
    })
  }

  const client = await pool.connect()

  try {
    return await loadReviews({
      client,
      artifactId
    })
  } finally {
    client.release()
  }
})
