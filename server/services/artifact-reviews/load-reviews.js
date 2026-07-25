export async function loadReviews({ client, artifactId }) {
  const { rows } = await client.query(
    `
    SELECT
      id,
      artifact_id,
      decision,
      feedback,
      reviewed_by,
      reviewed_at
    FROM artifact_reviews
    WHERE artifact_id = $1
    ORDER BY reviewed_at DESC
    `,
    [artifactId]
  )

  return rows.map((row) => ({
    id: row.id,
    artifactId: row.artifact_id,
    decision: row.decision,
    feedback: row.feedback,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at
  }))
}
