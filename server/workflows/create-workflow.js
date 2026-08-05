import { validateWorkflow } from './validate-workflow.js'

export function createWorkflow(workflow) {
  validateWorkflow(workflow)

  return Object.freeze(workflow)
}
