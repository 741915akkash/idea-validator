import execute from './execute.js'

export default {
  id: 'calculator',

  version: 1,

  name: 'Calculator',

  description: 'Evaluate a mathematical expression.',

  inputSchema: {
    expression: {
      type: 'string',
      required: true
    }
  },

  outputSchema: {
    result: {
      type: 'number',
      required: true
    }
  },

  validateInput(input) {
    return typeof input?.expression === 'string'
  },

  normalizeInput(input) {
    return {
      expression: input.expression.trim()
    }
  },

  validateOutput(output) {
    return typeof output?.result === 'number'
  },

  normalizeOutput(output) {
    return {
      result: output.result
    }
  },

  execute
}
