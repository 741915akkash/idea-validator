import { EMPTY_AGENT_RESULT } from './contracts.js'
import { validateAndNormalizeArtifacts } from './validate-and-normalize-artifacts.js'
import { validateTasks } from './validate-and-normalize-tasks.js'

export function parseAgentOutput({ text, run }) {
  if (!run.success) {
    return {
      ...EMPTY_AGENT_RESULT,
      run
    }
  }

  try {
    const output = JSON.parse(text)

    const artifactResult = validateAndNormalizeArtifacts(output.artifacts)

    const taskResult = validateTasks(output.tasks)

    return {
      ...EMPTY_AGENT_RESULT,

      artifacts: artifactResult.artifacts,

      tasks: taskResult.tasks,

      warnings: [...artifactResult.warnings, ...taskResult.warnings],

      run
    }
  } catch (error) {
    return {
      ...EMPTY_AGENT_RESULT,

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
