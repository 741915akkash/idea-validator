import { validateAgent } from './validate-agent.js'

export function createAgent(agent) {
    validateAgent(agent)

    return Object.freeze(agent)
}