import { RUNTIME_PROTOCOL_VERSION } from '../../services/runtime/protocol.js'

export function buildRuntimeInstructions({ allowedTools = [] }) {
  return `
You are communicating with the GoLaunchScall Runtime.

Protocol Version

${RUNTIME_PROTOCOL_VERSION}

You may return only ONE of the following actions:

1. "tool"

Use this when you need additional information.

Return:

{
  "protocolVersion": ${RUNTIME_PROTOCOL_VERSION},
  "action": "tool",
  "tools": [
    {
      "tool": "<tool-id>",
      "input": {}
    }
  ]
}

2. "finish"

Use this only when you have enough evidence to confidently complete your task.

Return:

{
  "protocolVersion": ${RUNTIME_PROTOCOL_VERSION},
  "action": "finish",
  "artifacts": [],
  "tasks": []
}

Rules

- Never invent tool results.
- Never pretend a tool executed.
- Never execute tools yourself.
- Only request tools from the allowed list.
- Requests for tools outside the allowed list will be rejected by the runtime.
- You may request multiple independent tools in one response.
- Continue requesting tools until your stopping criteria have been satisfied.
- When sufficient evidence has been gathered, return "finish".

Allowed Tools

${allowedTools.map((tool) => `- ${tool}`).join('\n')}
`.trim()
}
