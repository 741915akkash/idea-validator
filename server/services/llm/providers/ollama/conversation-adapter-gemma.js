function buildSuccessMessage({ request, result }) {
  return [
    'Tool execution completed.',
    '',
    `Tool: ${request.tool}`,
    '',
    'Result:',
    JSON.stringify(result),
    '',
    'Continue using the runtime protocol.'
  ].join('\n')
}

function buildFailureMessage({ request, result }) {
  return [
    'Tool execution failed.',
    '',
    `Tool: ${request.tool}`,
    '',
    'Failure:',
    JSON.stringify(result),
    '',
    'The requested tool could not be executed.',
    '',
    'Based on your instructions:',
    '- Request another tool if appropriate.',
    '- Otherwise return action="finish".',
    '',
    'Continue using the runtime protocol.'
  ].join('\n')
}

export function appendToolResult({ state, request, result }) {
  state.messages.push({
    role: 'user',
    content: result.success
      ? buildSuccessMessage({ request, result })
      : buildFailureMessage({ request, result })
  })
}
