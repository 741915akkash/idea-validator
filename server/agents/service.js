import registry from './registry.js'

const artifactProducerIndex = buildProducerIndex()

function buildProducerIndex() {
  const index = new Map()

  for (const agent of Object.values(registry)) {

    // console.log('Agent:', agent.id)
    // console.log(agent)

    // if (!agent.contract) {
    //   throw new Error(`Agent "${agent.id}" has no contract.`)
    // }

    for (const artifactType of agent.contract.producesArtifacts) {
      if (!index.has(artifactType)) {
        index.set(artifactType, [])
      }

      index.get(artifactType).push(agent)
    }
  }

  return index
}

function get(id) {
  const agent = registry[id]

  if (!agent) {
    throw new Error(`Unknown agent "${id}".`)
  }

  return agent
}

function getMany(ids = []) {
  return ids.map(get)
}

function exists(id) {
  return id in registry
}

function list() {
  return Object.values(registry)
}

function getProducers(artifactType) {
  return artifactProducerIndex.get(artifactType) ?? []
}

function getProducer(artifactType) {
  const producers = getProducers(artifactType)

  if (producers.length === 0) {
    throw new Error(`No agent produces artifact "${artifactType}".`)
  }

  if (producers.length > 1) {
    throw new Error(`Multiple agents produce artifact "${artifactType}".`)
  }

  return producers[0]
}

export default {
  get,
  getMany,
  exists,
  list,

  getProducer,
  getProducers
}
