import { pool } from '../../../../db/index.js'

import { loadArtifact } from '../../../../services/artifacts/load-artifact.js'
import { loadReviews } from '../../../../services/artifact-reviews/load-reviews.js'
import { getParents } from '../../../../services/artifacts/get-parents.js'
import { getChildren } from '../../../../services/artifacts/get-children.js'

export default defineEventHandler(async (event) => {
  const { artifactId } = event.context.params

  const client = await pool.connect()

  try {
    const artifact = await loadArtifact({
      client,
      artifactId
    })

    const [reviews, parents, children] = await Promise.all([
      loadReviews({
        client,
        artifactId
      }),

      getParents({
        client,
        artifactId
      }),

      getChildren({
        client,
        artifactId
      })
    ])

    return {
      artifact,
      reviews,
      parents,
      children
    }
  } finally {
    client.release()
  }
})
