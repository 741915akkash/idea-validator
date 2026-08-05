import { invalidFinishResponse } from './runtime-errors.js'

export function validateFinishResponse(response) {
  if (!Array.isArray(response.artifacts)) {
    throw invalidFinishResponse('"artifacts" must be an array.')
  }

  if (!Array.isArray(response.tasks)) {
    throw invalidFinishResponse('"tasks" must be an array.')
  }

  for (const artifact of response.artifacts) {
    if (!artifact || typeof artifact !== 'object') {
      throw invalidFinishResponse('Every artifact must be an object.')
    }

    if (typeof artifact.type !== 'string') {
      throw invalidFinishResponse('Artifact "type" must be a string.')
    }

    if (typeof artifact.title !== 'string') {
      throw invalidFinishResponse('Artifact "title" must be a string.')
    }

    if (typeof artifact.summary !== 'string') {
      throw invalidFinishResponse('Artifact "summary" must be a string.')
    }

    if (
      artifact.content === null ||
      typeof artifact.content !== 'object' ||
      Array.isArray(artifact.content)
    ) {
      throw invalidFinishResponse('Artifact "content" must be an object.')
    }
  }

  for (const task of response.tasks) {
    if (!task || typeof task !== 'object') {
      throw invalidFinishResponse('Every task must be an object.')
    }

    if (typeof task.title !== 'string') {
      throw invalidFinishResponse('Task "title" must be a string.')
    }

    if (typeof task.description !== 'string') {
      throw invalidFinishResponse('Task "description" must be a string.')
    }

    if (typeof task.priority !== 'string') {
      throw invalidFinishResponse('Task "priority" must be a string.')
    }

    if (typeof task.taskType !== 'string') {
      throw invalidFinishResponse('Task "taskType" must be a string.')
    }
  }

  return {
    artifacts: response.artifacts,
    tasks: response.tasks
  }
}
