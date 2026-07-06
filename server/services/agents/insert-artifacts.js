import { createArtifact } from '../artifacts/create-artifact.js'

export async function insertArtifacts(client, { workspaceContext, agent, artifacts }) {
  if (!artifacts?.length) {
    return []
  }

  const insertedArtifacts = []

  for (const artifact of artifacts) {
    const created = await createArtifact({
      client,
      workspaceContext,
      agent,
      artifact
    })

    insertedArtifacts.push(created)
  }

  return insertedArtifacts
}
