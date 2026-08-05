import { RUNTIME_PROTOCOL_VERSION } from '../../services/runtime/protocol.js'

export function buildOutputContract() {
  return `
# Output Format

When finishing, return ONLY valid JSON using the runtime finish protocol.

{
  "protocolVersion": ${RUNTIME_PROTOCOL_VERSION},
  "action": "finish",
  "artifacts": [
    {
      "type": "",
      "title": "",
      "summary": "",
      "content": {}
    }
  ],

  "tasks": [
    {
      "title": "",
      "description": "",
      "priority": "low | medium | high",
      "taskType": ""
    }
  ]
}

Rules

- Return ONLY valid JSON using the runtime finish protocol.
- Do NOT include markdown.
- Do NOT include code fences.
- Do NOT include explanations.
- Every artifact must include:
  - type
  - title
  - summary
  - content
- Every task must include:
  - title
  - description
  - priority
  - taskType
- Return empty arrays when nothing should be created.
`
}
