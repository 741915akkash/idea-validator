import execute from './execute.js'

export default {
  id: 'linkedin',

  version: 1,

  name: 'LinkedIn',

  description: 'Research public LinkedIn profiles and companies.',

  inputSchema: {
    action: {
      type: 'string',
      required: true
    },

    input: {
      type: 'object',
      required: true
    }
  },

  outputSchema: {
    data: {
      type: 'object',
      required: true
    }
  },

  validateInput(input) {
    return typeof input?.action === 'string' && typeof input?.input === 'object'
  },

  normalizeInput(input) {
    return {
      action: input.action.trim().toLowerCase(),
      input: input.input ?? {}
    }
  },

  validateOutput(output) {
    return typeof output?.data === 'object'
  },

  normalizeOutput(output) {
    return {
      data: output.data ?? {}
    }
  },

  execute
}
