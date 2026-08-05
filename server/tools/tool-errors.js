function createToolError(code, message) {
  return {
    success: false,

    error: {
      code,
      message
    }
  }
}

export function unknownTool(toolId) {
  return createToolError('UNKNOWN_TOOL', `Unknown tool "${toolId}".`)
}

export function invalidToolInput(toolId) {
  return createToolError('INVALID_TOOL_INPUT', `Input validation failed for tool "${toolId}".`)
}

export function invalidToolOutput(toolId) {
  return createToolError('INVALID_TOOL_OUTPUT', `Output validation failed for tool "${toolId}".`)
}

export function toolExecutionFailed(message) {
  return createToolError('TOOL_EXECUTION_FAILED', message)
}

export function unknownAction(action) {
  return createToolError('UNKNOWN_ACTION', `Unknown action "${action}".`)
}

export function googleSearchNotConfigured() {
  return createToolError('GOOGLE_SEARCH_NOT_CONFIGURED', 'Google Search credentials are missing.')
}

export function googleSearchFailed(message) {
  return createToolError('GOOGLE_SEARCH_FAILED', message)
}

export function fileFailed(message) {
  return createToolError('FILE_FAILED', message)
}
