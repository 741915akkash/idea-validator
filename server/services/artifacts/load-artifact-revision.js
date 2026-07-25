import { loadArtifact } from './load-artifact.js'
import { loadLatestReview } from '../artifact-reviews/load-latest-review.js'

export async function loadArtifactRevision({ client, artifactId }) {
  const artifact = await loadArtifact({
    client,
    artifactId
  })

  const review = await loadLatestReview({
    client,
    artifactId
  })

  return {
    artifact,
    review
  }
}
