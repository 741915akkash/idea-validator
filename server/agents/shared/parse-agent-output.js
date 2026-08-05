import { DEFAULT_AGENT_RESULT } from './contracts.js'
import { validateAndNormalizeArtifacts } from './validate-and-normalize-artifacts.js'
import { validateTasks } from './validate-and-normalize-tasks.js'

function normalizeResponse(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

export function parseAgentOutput({ text, run }) {
  if (!run.success) {
    return {
      ...DEFAULT_AGENT_RESULT,
      run
    }
  }

  try {
    const normalized = normalizeResponse(text)

    const output = JSON.parse(normalized)

    const artifactResult = validateAndNormalizeArtifacts(output.artifacts)

    const taskResult = validateTasks(output.tasks)

    return {
      ...DEFAULT_AGENT_RESULT,

      artifacts: artifactResult.artifacts,

      tasks: taskResult.tasks,

      warnings: [...artifactResult.warnings, ...taskResult.warnings],

      run
    }
  } catch (error) {
    return {
      ...DEFAULT_AGENT_RESULT,

      warnings: [
        {
          code: 'INVALID_JSON',
          message: error.message
        }
      ],

      run: {
        ...run,
        success: false,
        error: error.message
      }
    }
  }
}
