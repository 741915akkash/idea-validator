import { loadArtifact } from './load-artifact.js'
import { loadReviews } from '../artifact-reviews/load-reviews.js'

export async function buildRevisionContext({ client, artifactId }) {
  const artifact = await loadArtifact({
    client,
    artifactId
  })

  const reviews = await loadReviews({
    client,
    artifactId
  })

  return {
    artifact,
    review: reviews[0] ?? null
  }
}
