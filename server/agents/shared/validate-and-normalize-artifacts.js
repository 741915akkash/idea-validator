import ArtifactService from '../../artifacts/service.js'

export function validateAndNormalizeArtifacts(artifacts = []) {
  const validArtifacts = []
  const warnings = []

  for (const artifact of artifacts) {
    const result = ArtifactService.validateAndNormalize(artifact)

    if (!result.success) {
      warnings.push(result.warning)
      continue
    }

    validArtifacts.push(result.artifact)
  }

  return {
    artifacts: validArtifacts,
    warnings
  }
}
