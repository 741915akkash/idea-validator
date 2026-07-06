import registry from './registry.js'

function get(id) {
  return registry[id] ?? null
}

function getMany(ids = []) {
  return ids.map((id) => registry[id]).filter(Boolean)
}

function exists(id) {
  return id in registry
}

function getRequiredArtifacts(id) {
  return get(id)?.requiredArtifacts ?? []
}

export default {
  get,
  getMany,
  exists,
  getRequiredArtifacts
}
