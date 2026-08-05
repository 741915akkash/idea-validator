import registry from './registry.js'
import { unknownTool, invalidToolInput, invalidToolOutput } from './tool-errors.js'

function get(id) {
  return registry[id] ?? null
}

function describe(id) {
  const tool = get(id)

  if (!tool) {
    return null
  }

  return {
    id: tool.id,
    version: tool.version,

    name: tool.name,
    description: tool.description,

    inputSchema: tool.inputSchema,
    outputSchema: tool.outputSchema
  }
}

function getSchema(id) {
  const tool = get(id)

  if (!tool) {
    return null
  }

  return {
    input: tool.inputSchema,
    output: tool.outputSchema
  }
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
    return unknownTool(toolId)
  }

  if (!tool.validateInput(input)) {
    return invalidToolInput(toolId)
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
    return unknownTool(toolId)
  }

  if (!tool.validateOutput(output)) {
    return invalidToolOutput(toolId)
  }

  return {
    success: true,
    output: tool.normalizeOutput(output)
  }
}

function buildPromptSection(ids = []) {
  const tools = getMany(ids)

  function buildExampleInput(schema = {}) {
    const input = {}

    for (const [key, field] of Object.entries(schema)) {
      switch (field.type) {
        case 'string':
          input[key] = `<${key}>`
          break

        case 'number':
          input[key] = 0
          break

        case 'boolean':
          input[key] = true
          break

        case 'array':
          input[key] = []
          break

        case 'object':
          input[key] = {}
          break

        default:
          input[key] = null
      }
    }

    return input
  }

  const allowedTools = tools.map((tool) => `- ${tool.id}`).join('\n')

  const descriptions = tools
    .map((tool) => {
      const example = {
        tool: tool.id,
        input: buildExampleInput(tool.inputSchema)
      }

      return `
### ${tool.id}

${tool.description}

Example Tool Request

${JSON.stringify(example, null, 2)}

Input Schema

${JSON.stringify(tool.inputSchema, null, 2)}

Output Schema

${JSON.stringify(tool.outputSchema, null, 2)}
`
    })
    .join('\n')

  return `
# Allowed Tools

You may ONLY use these tools.

${allowedTools}

# Tool Descriptions

${descriptions}
`
}

export default {
  get,
  getSchema,
  describe,
  getMany,
  exists,

  validateInput,
  normalizeInput,
  validateAndNormalizeInput,

  validateOutput,
  normalizeOutput,
  validateAndNormalizeOutput,

  buildPromptSection
}
