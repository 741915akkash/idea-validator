import {
  maxIterationsExceeded,
  runtimeTimedOut,
  maxToolCallsExceeded,
  toolNotAllowed
} from './runtime-errors.js'

const DEFAULT_POLICY = {
  maxIterations: 8,
  maxToolCalls: 16,
  timeoutMs: 60_000
}

export function getExecutionPolicy(overrides = {}) {
  const policy = {
    ...DEFAULT_POLICY,
    ...overrides
  }

  return {
    beforeIteration(state) {
      assertIterations(state, policy)
      assertTimeout(state, policy)
    },

    beforeToolExecution(state, agent, toolRequests) {
      assertToolLimit(state, toolRequests, policy)
      assertAllowedTools(agent, toolRequests)
    },

    beforeFinish(state, runtimeResponse) {
      // Reserved for future execution rules.
      //
      // Examples:
      // - approval required
      // - artifact count limits
      // - credit validation
      // - workspace quota
    }
  }
}

function assertIterations(state, policy) {
  if (state.iteration > policy.maxIterations) {
    throw maxIterationsExceeded()
  }
}

function assertTimeout(state, policy) {
  const elapsedMs = Date.now() - state.run.startedAt.getTime()

  if (elapsedMs >= policy.timeoutMs) {
    throw runtimeTimedOut()
  }
}

function assertToolLimit(state, toolRequests, policy) {
  const requestedToolCalls = toolRequests.length

  if (state.run.tools.calls + requestedToolCalls > policy.maxToolCalls) {
    throw maxToolCallsExceeded()
  }
}

function assertAllowedTools(agent, toolRequests) {
  const allowedTools = new Set(agent.capabilities.tools)

  for (const request of toolRequests) {
    if (!allowedTools.has(request.tool)) {
      throw toolNotAllowed(agent.id, request.tool)
    }
  }
}
