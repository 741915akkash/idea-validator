import execute from './execute.js'

const actions = [
  'read',
  'write',
  'metadata',
  'merge',
  'split',
  'rotate',
  'extract-pages',
  'delete-pages',
  'compress',
  'watermark',
  'encrypt',
  'decrypt',
  'fill-form',
  'extract-images',
  'extract-tables',
  'ocr',
  'thumbnail',
  'sign'
]

export default {
  id: 'pdf',

  version: 1,

  name: 'PDF',

  description: 'Read, generate and manipulate PDF documents.',

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
