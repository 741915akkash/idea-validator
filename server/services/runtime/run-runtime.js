import { ACTIONS } from './protocol.js'
import { createRuntimeState } from './runtime-state.js'
import { getExecutionPolicy } from './execution-policy.js'
import { runLlmStep } from './run-llm-step.js'
import { executeToolRequests } from './execute-tool-requests.js'
import { RUNTIME_STATUS } from './runtime-status.js'

export async function runRuntime({ agent, messages, policy }) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚙️ Runtime Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const state = createRuntimeState({
    agent,
    messages
  })

  const executionPolicy = getExecutionPolicy(policy)

  state.run.status = RUNTIME_STATUS.RUNNING
  state.run.startedAt = new Date()

  try {
    while (true) {
      state.iteration += 1

      console.log('')
      console.log(`🔄 Iteration ${state.iteration}`)

      executionPolicy.beforeIteration(state)

      const runtimeResponse = await runLlmStep(state)

      console.log('Runtime Action')
      console.log(runtimeResponse.action)

      if (runtimeResponse.action === ACTIONS.TOOL) {
        console.log(`🛠 Executing ${runtimeResponse.tools.length} tool(s)`)

        executionPolicy.beforeToolExecution(state, agent, runtimeResponse.tools)

        await executeToolRequests(state, runtimeResponse.tools)

        continue
      }

      if (runtimeResponse.action === ACTIONS.FINISH) {
        executionPolicy.beforeFinish(state, runtimeResponse)

        console.log('🏁 Runtime Finished')

        state.run.status = RUNTIME_STATUS.FINISHED
        state.run.finishedAt = new Date()

        console.log({
          iterations: state.iteration,
          llmCalls: state.run.llm.calls,
          toolCalls: state.run.tools.calls,
          latencyMs: state.run.llm.latencyMs,
          totalTokens: state.run.llm.totalTokens
        })

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        return {
          ...runtimeResponse,

          run: {
            success: true,
            ...state.run
          }
        }
      }
    }
  } catch (error) {
    state.run.status = RUNTIME_STATUS.FAILED
    state.run.finishedAt = new Date()

    throw error
  }
}
