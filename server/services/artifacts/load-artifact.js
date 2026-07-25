export async function loadArtifact({ client, artifactId }) {
  const { rows } = await client.query(
    `
    SELECT *
    FROM artifacts
    WHERE id = $1
    LIMIT 1
    `,
    [artifactId]
  )

  if (rows.length === 0) {
    throw new Error(`Artifact not found: ${artifactId}`)
  }

  const row = rows[0]

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    quizId: row.quiz_id,
    taskId: row.task_id,
    type: row.type,
    title: row.title,
    summary: row.summary,
    content: row.content_json,
    sourceAgent: row.source_agent,
    status: row.status,
    revisionNumber: row.revision_number,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    supersededBy: row.superseded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}
