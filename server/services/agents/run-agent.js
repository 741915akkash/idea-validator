import registry from '../../agents/registry.js'
import { buildWorkspaceContext } from '../workspaces/build-workspace-context.js'
import { buildAgentContext } from './build-agent-context.js'
import { saveAgentOutput } from './save-agent-output.js'
import { runRuntime } from '../runtime/run-runtime.js'

export async function runAgent({ workspaceId, workspaceContext, agent, context = {} }) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 Agent Run Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log({
    workspaceId,
    agent
  })

  const agentDefinition = registry[agent]

  if (!agentDefinition) {
    throw new Error(`Unknown agent: ${agent}`)
  }

  console.log('📦 Building workspace context...')

  workspaceContext ??= await buildWorkspaceContext({
    workspaceId,
    context
  })

  console.log('✅ Workspace context built')

  console.log('🧠 Building agent context...')

  const agentContext = await buildAgentContext({
    workspaceContext,
    agent: agentDefinition
  })

  console.log('✅ Agent context built')
  console.log({
    requiredArtifacts: agentContext.requiredArtifacts.length
  })

  const startedAt = new Date()

  console.log('🤖 Preparing agent...')

  const runtime = await agentDefinition.execute(agentContext)

  console.log('✅ Agent prepared')
  console.log({
    messages: runtime.messages.length
  })

  console.log('🚀 Starting runtime...')

  const result = await runRuntime({
    agent: agentDefinition,
    messages: runtime.messages,
  })

  result.run ??= {}
  result.run.success ??= true

  const completedAt = new Date()

  result.run.durationMs = completedAt.getTime() - startedAt.getTime()

  console.log('💾 Saving output...')

  const saved = await saveAgentOutput({
    workspaceContext,
    requiredArtifacts: agentContext.requiredArtifacts,
    agent: agentDefinition,
    result,
    startedAt,
    completedAt
  })

  result.artifacts = saved.artifacts

  console.log('✅ Agent Run Finished')
  console.log({
    durationMs: result.run.durationMs
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return result
}
