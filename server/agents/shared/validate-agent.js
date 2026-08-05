import artifactService from '../../artifacts/service.js'
import toolService from '../../tools/service.js'

export function validateAgent(agent) {
  const requiredFields = ['id', 'version', 'name', 'description', 'contract', 'execute']

  for (const field of requiredFields) {
    if (!(field in agent)) {
      throw new Error(`Agent "${agent.id ?? 'unknown'}" is missing "${field}".`)
    }
  }

  validateContract(agent)

  return agent
}

function validateContract(agent) {
  const contract = agent.contract

  const requiredContractFields = [
    'requiresContext',
    'requiresArtifacts',
    'producesArtifacts',
    'tools'
  ]

  for (const field of requiredContractFields) {
    if (!(field in contract)) {
      throw new Error(`Agent "${agent.id}" contract is missing "${field}".`)
    }

    if (!Array.isArray(contract[field])) {
      throw new Error(`Agent "${agent.id}" contract "${field}" must be an array.`)
    }
  }

  for (const artifactType of contract.requiresArtifacts) {
    if (!artifactService.exists(artifactType)) {
      throw new Error(`Agent "${agent.id}" requires unknown artifact "${artifactType}".`)
    }
  }

  for (const artifactType of contract.producesArtifacts) {
    if (!artifactService.exists(artifactType)) {
      throw new Error(`Agent "${agent.id}" produces unknown artifact "${artifactType}".`)
    }
  }

  for (const tool of contract.tools) {
    if (!toolService.exists(tool)) {
      throw new Error(`Agent "${agent.id}" uses unknown tool "${tool}".`)
    }
  }
}
