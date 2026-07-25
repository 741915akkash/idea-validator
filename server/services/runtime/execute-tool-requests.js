import executeTool from '../tools/execute-tool.js'
import providers from '../llm/providers/registry.js'
import { LLM_CONFIG } from '../../config/llm.js'

export async function executeToolRequests(state, toolRequests) {
  const provider = providers[LLM_CONFIG.provider]

  const results = []

  for (const request of toolRequests) {
    console.log('')
    console.log(`🔧 Tool: ${request.tool}`)
    console.log('Input')
    console.log(request.input)

    const result = await executeTool({
      toolId: request.tool,
      input: request.input,
      context: {
        agent: state.agent
      }
    })

    state.run.tools.calls += 1

    // Track total API cost for the runtime
    if (result.success) {
      state.run.totalCostUsd += result.metadata?.cost?.amount ?? 0
    }

    state.toolHistory.push({
      request,
      result
    })

    provider.conversation.appendToolResult({
      state,
      request,
      result
    })

    console.log('✅ Tool Complete')
    console.log(result.output ?? result)

    results.push({
      request,
      result
    })
  }

  return results
}
