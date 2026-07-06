import ArtifactService from '../../artifacts/service.js'

export function buildArtifactSection(allowedArtifacts = []) {
  return ArtifactService.buildPromptSection(allowedArtifacts)
}
