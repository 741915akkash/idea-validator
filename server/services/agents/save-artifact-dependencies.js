export async function saveArtifactDependencies(
  client,
  { parentArtifacts = [], childArtifacts = [] }
) {
  if (!parentArtifacts.length || !childArtifacts.length) {
    return
  }

  for (const parent of parentArtifacts) {
    for (const child of childArtifacts) {
      await client.query(
        `
        INSERT INTO artifact_dependencies (
          parent_artifact_id,
          child_artifact_id,
          relationship
        )
        VALUES (
          $1,
          $2,
          'derived-from'
        )
        ON CONFLICT DO NOTHING
        `,
        [parent.id, child.id]
      )
    }
  }
}
