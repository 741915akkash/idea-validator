import { RUNTIME_PROTOCOL_VERSION } from '../../services/runtime/protocol.js'

export function buildRuntimeInstructions({ allowedTools = [] }) {
  return `
You are communicating with the GoLaunchScall Runtime.

Protocol Version

${RUNTIME_PROTOCOL_VERSION}

You must return exactly ONE runtime action.

--------------------------------------------------
Action: "tool"
--------------------------------------------------

Use this when you need information before you can complete your task.

Return ONLY:

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

Example

{
  "protocolVersion": ${RUNTIME_PROTOCOL_VERSION},
  "action": "tool",
  "tools": [
    {
      "tool": "google-search",
      "input": {
        "query": "AI accounting software market size"
      }
    }
  ]
}

Rules

- The "tools" property is REQUIRED.
- "tools" must always be an array.
- Request one or more tools.
- Do NOT include "artifacts".
- Do NOT include "tasks".
- Never invent tool results.
- Never pretend a tool executed.
- Never execute tools yourself.

--------------------------------------------------
Action: "finish"
--------------------------------------------------

Use this only when you have enough information to complete your task.

Return ONLY:

{
  "protocolVersion": ${RUNTIME_PROTOCOL_VERSION},
  "action": "finish",
  "artifacts": [],
  "tasks": []
}

Rules

- The "artifacts" property is REQUIRED.
- The "tasks" property is REQUIRED.
- Do NOT include "tools".

--------------------------------------------------
General Rules
--------------------------------------------------

- Return ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include code fences.
- Do NOT include explanations.
- Choose exactly one action.
- Only request tools from the allowed list.
- Requests for tools outside the allowed list will be rejected.
- When sufficient evidence has been gathered, return "finish".

Allowed Tools

${allowedTools.map((tool) => `- ${tool}`).join('\n')}
`.trim()
}
