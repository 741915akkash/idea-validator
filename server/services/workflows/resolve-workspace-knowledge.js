import ArtifactService from '../../artifacts/service.js'

export function resolveWorkspaceKnowledge({ workspaceContext, requiredArtifacts = [] }) {
  const existingArtifacts = workspaceContext.artifacts ?? []

  const artifactsByType = new Map()

  for (const artifact of existingArtifacts) {
    if (!ArtifactService.isUsable(artifact)) {
      continue
    }

    if (!artifactsByType.has(artifact.type)) {
      artifactsByType.set(artifact.type, [])
    }

    artifactsByType.get(artifact.type).push(artifact)
  }

  const existing = []
  const missing = []

  for (const artifactType of requiredArtifacts) {
    const artifacts = artifactsByType.get(artifactType) ?? []

    if (artifacts.length) {
      existing.push({
        type: artifactType,
        artifacts,
        latest: ArtifactService.latestUsable(artifacts)
      })
    } else {
      missing.push(artifactType)
    }
  }

  return {
    existing,
    missing,
    artifactsByType
  }
}
