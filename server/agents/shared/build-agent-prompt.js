import { buildArtifactSection } from './build-artifact-section.js'
import { buildOutputContract } from './build-output-contract.js'
import { buildRuntimeInstructions } from '../../services/runtime/runtime-instructions.js'

export function buildPrompt({ system, user, allowedArtifacts, allowedTools }) {
  return {
    system: `
${system}

${buildRuntimeInstructions({
  allowedTools
})}
`,

    user: `
${user}

${buildArtifactSection(allowedArtifacts)}

${buildOutputContract()}
`
  }
}
