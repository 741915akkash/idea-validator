export async function createReview({
  client,
  artifactId,
  decision,
  feedback = null,
  reviewedBy = null
}) {
  const { rows } = await client.query(
    `
    INSERT INTO artifact_reviews (
      artifact_id,
      decision,
      feedback,
      reviewed_by
    )
    VALUES (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING
      id,
      artifact_id,
      decision,
      feedback,
      reviewed_by,
      reviewed_at
    `,
    [artifactId, decision, feedback, reviewedBy]
  )

  const row = rows[0]

  return {
    id: row.id,
    artifactId: row.artifact_id,
    decision: row.decision,
    feedback: row.feedback,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at
  }
}
