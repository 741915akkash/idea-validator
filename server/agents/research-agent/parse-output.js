import { EMPTY_AGENT_RESULT } from '../shared/contracts.js'

export function parseOutput({ text, run }) {
  try {
    const output = JSON.parse(text)

    return {
      ...EMPTY_AGENT_RESULT,

      artifacts: ensureArray(output.artifacts),

      tasks: ensureArray(output.tasks),

      run
    }
  } catch (error) {
    return {
      ...EMPTY_AGENT_RESULT,

      warnings: ['Failed to parse LLM response as JSON.'],

      run: {
        ...run,
        success: false,
        error: error.message
      }
    }
  }
}

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}
