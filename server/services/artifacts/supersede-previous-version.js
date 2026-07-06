export async function supersedePreviousVersion({
  client,
  workspaceId,
  artifactType,
  newArtifactId
}) {
  const { rows } = await client.query(
    `
    SELECT id
    FROM artifacts
    WHERE
      workspace_id = $1
      AND type = $2
      AND status <> 'superseded'
      AND id <> $3
    ORDER BY revision_number DESC
    LIMIT 1
    `,
    [workspaceId, artifactType, newArtifactId]
  )

  if (!rows.length) {
    return
  }

  await client.query(
    `
    UPDATE artifacts
    SET
      status = 'superseded',
      superseded_by = $1
    WHERE id = $2
    `,
    [newArtifactId, rows[0].id]
  )
}
