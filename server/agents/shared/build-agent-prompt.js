import { buildArtifactSection } from './build-artifact-section.js'
import { buildOutputContract } from './build-output-contract.js'

export function buildPrompt({ system, user, allowedArtifacts }) {
  return {
    system,

    user: `
${user}

${buildArtifactSection(allowedArtifacts)}

${buildOutputContract()}
`
  }
}
