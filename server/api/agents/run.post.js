import { readBody, createError } from 'h3'
import { runAgent } from '../../services/agents/run-agent.js'

export default defineEventHandler(async (event) => {
  const { workspaceId, agent } = await readBody(event)

  if (!workspaceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'workspaceId is required.'
    })
  }

  if (!agent) {
    throw createError({
      statusCode: 400,
      statusMessage: 'agent is required.'
    })
  }

  return runAgent({
    workspaceId,
    agent
  })
})
