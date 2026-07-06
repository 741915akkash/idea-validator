export function buildOutputContract() {
  return `
# Output Format

Return ONLY valid JSON.

{
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

- Return ONLY valid JSON.
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
