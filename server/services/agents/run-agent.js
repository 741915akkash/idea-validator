import registry from '../../agents/registry.js'
import { buildWorkspaceContext } from '../workspaces/build-workspace-context.js'
import { saveAgentOutput } from './save-agent-output.js'
import { buildAgentContext } from './build-agent-context.js'

export async function runAgent({ workspaceId, workspaceContext, agent }) {
  const agentDefinition = registry[agent]

  if (!agentDefinition) {
    throw new Error(`Unknown agent: ${agent}`)
  }

  workspaceContext ??= await buildWorkspaceContext({
    workspaceId
  })

  const agentContext = buildAgentContext({
    workspaceContext,
    agent: agentDefinition
  })

  const startedAt = new Date()

  try {
    const result = await agentDefinition.execute(agentContext)

    result.run ??= {}
    result.run.success ??= true

    const completedAt = new Date()

    result.run.durationMs = completedAt.getTime() - startedAt.getTime()

    await saveAgentOutput({
      workspaceContext,
      agent: agentDefinition,
      result,
      startedAt,
      completedAt
    })

    return result
  } catch (error) {
    throw error
  }
}
