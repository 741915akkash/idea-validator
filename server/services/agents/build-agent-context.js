import { pool } from '../../db/index.js'
import { loadArtifactRevision } from '../artifacts/load-artifact-revision.js'

export async function buildAgentContext({ workspaceContext, agent }) {
  const requiredArtifactTypes = new Set(agent.contract.requiresArtifacts)

  const requiredArtifacts = workspaceContext.artifacts.filter((artifact) =>
    requiredArtifactTypes.has(artifact.type)
  )

  const artifactsByType = {}

  for (const artifact of requiredArtifacts) {
    if (!artifactsByType[artifact.type]) {
      artifactsByType[artifact.type] = []
    }

    artifactsByType[artifact.type].push(artifact)
  }

  let revision = null

  const artifactId = workspaceContext.context?.revision?.artifactId

  if (artifactId) {
    const client = await pool.connect()

    try {
      revision = await loadArtifactRevision({
        client,
        artifactId
      })
    } finally {
      client.release()
    }
  }

  return {
    agent,

    ...workspaceContext,

    requiredArtifacts,

    artifactsByType,

    revision
  }
}
