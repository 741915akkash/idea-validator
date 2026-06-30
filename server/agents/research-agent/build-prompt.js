import { systemPrompt } from './system-prompt.js'

export async function buildPrompt(context) {
  const founderAnswers = context.quiz.quizAnswers
    .map((answer) => `Q: ${answer.question}\nA: ${answer.answer}`)
    .join('\n\n')

  const previousResearch =
    context.existingResearch.length === 0
      ? 'No previous research available.'
      : context.existingResearch
          .map(
            (artifact) => `
Type: ${artifact.type}
Title: ${artifact.title ?? 'Untitled'}
Summary: ${artifact.summary ?? 'No summary'}
`
          )
          .join('\n----------------------------------------\n')

  const user = `
# Startup

Name:
${context.workspace.name}

Description:
${context.workspace.description ?? 'No description provided.'}

# Founder Answers

${founderAnswers}

# Previous Research

${previousResearch}

# Your Task

Analyze this startup idea and produce research that helps the founder understand:

- Market attractiveness
- Customer pain
- Target customers
- Existing competitors
- Market opportunities
- Major risks
- Validation experiments to run next

Guidelines:

- Use the founder's answers as the primary source of truth.
- Build upon previous research instead of repeating it.
- If evidence is weak, clearly state your assumptions.
- Recommend customer validation tasks whenever appropriate.
- Be specific and actionable.

# Allowed Artifact Types

You may ONLY create these artifact types:

- market-analysis
- competitor-analysis
- insight

# Output Format

Return ONLY valid JSON.

{
  "artifacts": [
    {
      "type": "market-analysis | competitor-analysis | insight",
      "title": "",
      "summary": "",
      "content": {
        // Structured data specific to this artifact.
        // This object will be stored as content_json.
      }
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

- Return ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include code fences.
- Do NOT include explanatory text.
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
- If there are no artifacts, return:
  "artifacts": []
- If there are no tasks, return:
  "tasks": []
`

  return {
    system: systemPrompt,
    user
  }
}
