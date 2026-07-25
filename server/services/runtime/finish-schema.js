import { invalidFinishResponse } from './runtime-errors.js'

export function validateFinishResponse(response) {
  if (!Array.isArray(response.artifacts)) {
    throw invalidFinishResponse('"artifacts" must be an array.')
  }

  if (!Array.isArray(response.tasks)) {
    throw invalidFinishResponse('"tasks" must be an array.')
  }

  if (typeof response.summary !== 'string') {
    throw invalidFinishResponse('"summary" must be a string.')
  }

  return {
    summary: response.summary,
    artifacts: response.artifacts,
    tasks: response.tasks
  }
}
