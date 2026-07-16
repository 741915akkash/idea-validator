import registry from './registry.js'

function get(id) {
  return registry[id] ?? null
}

function getMany(ids = []) {
  return ids.map((id) => registry[id]).filter(Boolean)
}

function exists(id) {
  return id in registry
}

function validateInput(toolId, input) {
  const tool = get(toolId)

  if (!tool) {
    return false
  }

  return tool.validateInput(input)
}

function normalizeInput(toolId, input) {
  const tool = get(toolId)

  if (!tool) {
    return null
  }

  return tool.normalizeInput(input)
}

function validateAndNormalizeInput(toolId, input) {
  const tool = get(toolId)

  if (!tool) {
    return {
      success: false,
      warning: {
        code: 'UNKNOWN_TOOL',
        message: `Unknown tool "${toolId}".`
      }
    }
  }

  if (!tool.validateInput(input)) {
    return {
      success: false,
      warning: {
        code: 'INVALID_TOOL_INPUT',
        message: `Input validation failed for tool "${toolId}".`
      }
    }
  }

  return {
    success: true,
    input: tool.normalizeInput(input)
  }
}

function validateOutput(toolId, output) {
  const tool = get(toolId)

  if (!tool) {
    return false
  }

  return tool.validateOutput(output)
}

function normalizeOutput(toolId, output) {
  const tool = get(toolId)

  if (!tool) {
    return null
  }

  return tool.normalizeOutput(output)
}

function validateAndNormalizeOutput(toolId, output) {
  const tool = get(toolId)

  if (!tool) {
    return {
      success: false,
      warning: {
        code: 'UNKNOWN_TOOL',
        message: `Unknown tool "${toolId}".`
      }
    }
  }

  if (!tool.validateOutput(output)) {
    return {
      success: false,
      warning: {
        code: 'INVALID_TOOL_OUTPUT',
        message: `Output validation failed for tool "${toolId}".`
      }
    }
  }

  return {
    success: true,
    output: tool.normalizeOutput(output)
  }
}

export default {
  get,
  getMany,
  exists,

  validateInput,
  normalizeInput,
  validateAndNormalizeInput,

  validateOutput,
  normalizeOutput,
  validateAndNormalizeOutput
}
