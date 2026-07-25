class RuntimeError extends Error {
  constructor(code, message) {
    super(message)

    this.name = 'RuntimeError'
    this.code = code
  }
}

/*
|--------------------------------------------------------------------------
| Protocol
|--------------------------------------------------------------------------
*/

export function invalidRuntimeResponse(message) {
  return new RuntimeError('INVALID_RUNTIME_RESPONSE', message)
}

export function invalidProtocolVersion(version) {
  return new RuntimeError('INVALID_PROTOCOL_VERSION', `Unsupported runtime protocol "${version}".`)
}

export function invalidRuntimeAction(action) {
  return new RuntimeError('INVALID_RUNTIME_ACTION', `Unknown runtime action "${action}".`)
}

export function invalidToolRequest(message) {
  return new RuntimeError('INVALID_TOOL_REQUEST', message)
}

export function invalidFinishResponse(message) {
  return new RuntimeError('INVALID_FINISH_RESPONSE', message)
}

/*
|--------------------------------------------------------------------------
| Runtime Execution
|--------------------------------------------------------------------------
*/

export function maxIterationsExceeded() {
  return new RuntimeError('MAX_ITERATIONS_EXCEEDED', 'Maximum runtime iterations exceeded.')
}

export function runtimeTimedOut() {
  return new RuntimeError('RUNTIME_TIMEOUT', 'Runtime execution timed out.')
}

export function maxToolCallsExceeded() {
  return new RuntimeError('MAX_TOOL_CALLS_EXCEEDED', 'Maximum tool calls exceeded.')
}

export function toolNotAllowed(agentId, toolId) {
  return new RuntimeError(
    'TOOL_NOT_ALLOWED',
    `Tool "${toolId}" is not allowed for agent "${agentId}".`
  )
}
