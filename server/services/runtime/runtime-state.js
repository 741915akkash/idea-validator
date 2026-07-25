import { RUNTIME_PROTOCOL_VERSION } from './protocol.js'
import { RUNTIME_STATUS } from './runtime-status.js'

export function createRuntimeState({ agent, messages = [] }) {
  return {
    protocolVersion: RUNTIME_PROTOCOL_VERSION,

    runId: null,

    agent,

    messages: [...messages],

    toolHistory: [],

    iteration: 0,

    run: {
      status: RUNTIME_STATUS.PENDING,

      startedAt: null,
      finishedAt: null,

      llm: {
        calls: 0,

        provider: null,
        model: null,

        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,

        costUsd: 0,

        latencyMs: 0,

        rawResponses: []
      },

      tools: {
        calls: 0,

        // Total cost of all tool executions for this runtime.
        costUsd: 0
      }
    }
  }
}
