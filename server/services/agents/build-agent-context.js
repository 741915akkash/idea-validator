export function buildAgentContext({ workspaceContext, agent }) {
  const requiredArtifactTypes = new Set(agent.capabilities.requiresArtifacts)

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

  return {
    ...workspaceContext,

    artifacts: {
      all: workspaceContext.artifacts,
      required: requiredArtifacts,
      byType: artifactsByType
    }
  }
}
