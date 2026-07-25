import { invalidToolRequest } from './runtime-errors.js'

export function validateToolRequest(request) {
  if (!request || typeof request !== 'object') {
    throw invalidToolRequest('Tool request must be an object.')
  }

  if (!request.tool) {
    throw invalidToolRequest('Tool request is missing "tool".')
  }

  if (typeof request.tool !== 'string') {
    throw invalidToolRequest('"tool" must be a string.')
  }

  if ('reasoning' in request && typeof request.reasoning !== 'string') {
    throw invalidToolRequest('"reasoning" must be a string.')
  }

  if (!('input' in request)) {
    throw invalidToolRequest(`Tool "${request.tool}" is missing "input".`)
  }

  if (request.input === null || typeof request.input !== 'object' || Array.isArray(request.input)) {
    throw invalidToolRequest(`Tool "${request.tool}" input must be an object.`)
  }

  return {
    tool: request.tool,
    reasoning: request.reasoning,
    input: request.input
  }
}

export function normalizeToolRequests(requests) {
  if (!Array.isArray(requests)) {
    throw invalidToolRequest('"tools" must be an array.')
  }

  return requests.map(validateToolRequest)
}
