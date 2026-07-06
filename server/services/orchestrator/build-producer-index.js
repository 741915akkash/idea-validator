import agentRegistry from '../../agents/registry.js'

export function buildProducerIndex() {
  const index = new Map()

  for (const agent of Object.values(agentRegistry)) {
    for (const artifact of agent.capabilities.producesArtifacts) {
      if (!index.has(artifact)) {
        index.set(artifact, [])
      }

      index.get(artifact).push(agent)
    }
  }

  return index
}
