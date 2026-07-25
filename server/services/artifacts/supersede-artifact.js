export async function supersedeArtifact({ client, artifactId, supersededBy }) {
  await client.query(
    `
    UPDATE artifacts
    SET
      status = 'superseded',
      superseded_by = $2,
      updated_at = NOW()
    WHERE id = $1
    `,
    [artifactId, supersededBy]
  )
}
