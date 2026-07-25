export async function loadLatestReview({ client, artifactId }) {
  const { rows } = await client.query(
    `
    SELECT
      decision,
      feedback,
      reviewed_by,
      reviewed_at
    FROM artifact_reviews
    WHERE artifact_id = $1
    ORDER BY reviewed_at DESC
    LIMIT 1
    `,
    [artifactId]
  )

  if (rows.length === 0) {
    return null
  }

  return {
    decision: rows[0].decision,
    feedback: rows[0].feedback,
    reviewedBy: rows[0].reviewed_by,
    reviewedAt: rows[0].reviewed_at
  }
}
