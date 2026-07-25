import { createReview } from './create-review.js'
import { REVIEW_DECISION } from './constants.js'

export async function improveArtifact({ client, artifactId, feedback, reviewedBy = null }) {
  await createReview({
    client,
    artifactId,
    decision: REVIEW_DECISION.NEEDS_IMPROVEMENT,
    feedback,
    reviewedBy
  })
}
