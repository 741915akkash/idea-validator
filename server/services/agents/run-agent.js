import registry from '../../agents/registry.js'
import { buildWorkspaceContext } from '../workspaces/build-workspace-context.js'
import { saveAgentOutput } from './save-agent-output.js'

export async function runAgent({ workspaceId, agent }) {
  const agentDefinition = registry[agent]

  if (!agentDefinition) {
    throw new Error(`Unknown agent: ${agent}`)
  }

  const workspaceContext = await buildWorkspaceContext({
    workspaceId
  })

  const startedAt = new Date()

  try {
    const result = await agentDefinition.execute(workspaceContext)

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
