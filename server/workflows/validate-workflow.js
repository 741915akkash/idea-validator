import artifactService from '../artifacts/service.js'

export function validateWorkflow(workflow) {
  const requiredFields = ['id', 'version', 'name', 'description', 'artifacts']

  for (const field of requiredFields) {
    if (!(field in workflow)) {
      throw new Error(`Workflow "${workflow.id ?? 'unknown'}" is missing "${field}".`)
    }
  }

  if (!Array.isArray(workflow.artifacts)) {
    throw new Error(`Workflow "${workflow.id}" artifacts must be an array.`)
  }

  for (const artifactType of workflow.artifacts) {
    if (!artifactService.exists(artifactType)) {
      throw new Error(`Workflow "${workflow.id}" requires unknown artifact "${artifactType}".`)
    }
  }

  return workflow
}
