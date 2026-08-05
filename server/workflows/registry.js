import validateStartup from './validate-startup/index.js'

const registry = new Map()

registerWorkflow(validateStartup)

export function registerWorkflow(workflow) {
  if (registry.has(workflow.id)) {
    throw new Error(`Workflow "${workflow.id}" is already registered.`)
  }

  registry.set(workflow.id, workflow)

  return workflow
}

export function getWorkflow(id) {
  return registry.get(id) ?? null
}

export function getAllWorkflows() {
  return [...registry.values()]
}

export function hasWorkflow(id) {
  return registry.has(id)
}

export default registry
