import registry, { getWorkflow, getAllWorkflows, hasWorkflow } from './registry.js'

function get(id) {
  const workflow = getWorkflow(id)

  if (!workflow) {
    throw new Error(`Unknown workflow "${id}".`)
  }

  return workflow
}

function getMany(ids = []) {
  return ids.map(get)
}

function exists(id) {
  return hasWorkflow(id)
}

function list() {
  return getAllWorkflows()
}

export default {
  get,
  getMany,
  exists,
  list
}
