import { createReview } from './create-review.js'
import { REVIEW_DECISION } from './constants.js'

import { loadArtifact } from '../artifacts/load-artifact.js'
import { loadCurrentApproved } from '../artifacts/load-current-approved.js'
import { supersedeArtifact } from '../artifacts/supersede-artifact.js'
import { approveArtifact as approveArtifactStatus } from '../artifacts/lifecycle.js'

export async function approveArtifact({ client, artifactId, reviewedBy = null }) {
  const artifact = await loadArtifact({
    client,
    artifactId
  })

  if (artifact.status !== 'draft') {
    throw new Error(`Only draft artifacts can be approved. Current status: ${artifact.status}`)
  }

  const currentApproved = await loadCurrentApproved({
    client,
    workspaceId: artifact.workspaceId,
    artifactType: artifact.type
  })

  await createReview({
    client,
    artifactId,
    decision: REVIEW_DECISION.APPROVED,
    feedback: null,
    reviewedBy
  })

  if (currentApproved) {
    await supersedeArtifact({
      client,
      artifactId: currentApproved.id,
      supersededBy: artifact.id
    })
  }

  await approveArtifactStatus({
    client,
    artifactId: artifact.id,
    approvedBy: reviewedBy
  })

  return {
    success: true,
    artifactId: artifact.id
  }
}
