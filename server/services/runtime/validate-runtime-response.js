import { ACTIONS, RUNTIME_PROTOCOL_VERSION } from './protocol.js'
import { normalizeToolRequests } from './tool-request-schema.js'
import { validateFinishResponse } from './finish-schema.js'
import {
  invalidRuntimeResponse,
  invalidProtocolVersion,
  invalidRuntimeAction
} from './runtime-errors.js'

export function validateRuntimeResponse(response) {
  return validateProtocol(parseResponse(response))
}

function cleanResponse(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

export function parseResponse(response) {
  if (typeof response !== 'string') {
    return response
  }

  const cleaned = cleanResponse(response)

  try {
    return JSON.parse(cleaned)
  } catch (error) {
    throw invalidRuntimeResponse(`Invalid runtime JSON: ${error.message}`)
  }
}

function validateProtocol(response) {
  if (!response || typeof response !== 'object') {
    throw invalidRuntimeResponse('Runtime response must be an object.')
  }

  if (response.protocolVersion !== RUNTIME_PROTOCOL_VERSION) {
    throw invalidProtocolVersion(response.protocolVersion)
  }

  switch (response.action) {
    case ACTIONS.TOOL:
      return {
        protocolVersion: response.protocolVersion,
        action: ACTIONS.TOOL,
        tools: normalizeToolRequests(response.tools)
      }

    case ACTIONS.FINISH:
      return {
        protocolVersion: response.protocolVersion,
        action: ACTIONS.FINISH,
        ...validateFinishResponse(response)
      }

    default:
      throw invalidRuntimeAction(response.action)
  }
}
