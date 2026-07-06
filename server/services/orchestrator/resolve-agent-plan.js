import { buildProducerIndex } from './build-producer-index.js'
import { chooseBestProducer } from './choose-best-producer.js'

const producerIndex = buildProducerIndex()

export function resolveAgentPlan({ requiredArtifacts = [] }) {
  const plan = []
  const visited = new Set()

  for (const artifact of requiredArtifacts) {
    resolveArtifact(artifact, plan, visited)
  }

  return plan
}

function resolveArtifact(artifact, plan, visited) {
  const agent = findProducer(artifact)

  if (!agent) {
    throw new Error(`No agent produces artifact "${artifact}".`)
  }

  if (visited.has(agent.id)) {
    return
  }

  visited.add(agent.id)

  for (const dependency of agent.capabilities.requiresArtifacts) {
    resolveArtifact(dependency, plan, visited)
  }

  plan.push(agent)
}

function findProducer(artifactType) {
  const producers = producerIndex.get(artifactType)

  if (!producers?.length) {
    return null
  }

  return chooseBestProducer(producers)
}
