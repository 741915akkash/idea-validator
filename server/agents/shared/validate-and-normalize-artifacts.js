import ArtifactService from './../../artifacts/service.js'

export function validateAndNormalizeArtifacts(artifacts = []) {
  const validArtifacts = []
  const errors = []

  for (const artifact of artifacts) {
    const result = ArtifactService.validateAndNormalize(artifact)

    if (!result.success) {
      errors.push(result.error)
      continue
    }

    validArtifacts.push(result.artifact)
  }

  return {
    artifacts: validArtifacts,
    errors
  }
}
