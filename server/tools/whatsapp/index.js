import execute from './execute.js'

export default {
  id: 'whatsapp',

  version: 1,

  name: 'WhatsApp',

  description: 'Send a WhatsApp message using the Meta WhatsApp Cloud API.',

  inputSchema: {
    to: {
      type: 'string',
      required: true
    },

    message: {
      type: 'string',
      required: true
    }
  },

  outputSchema: {
    messageId: {
      type: 'string',
      required: true
    }
  },

  validateInput(input) {
    return typeof input?.to === 'string' && typeof input?.message === 'string'
  },

  normalizeInput(input) {
    return {
      to: input.to.trim(),
      message: input.message.trim()
    }
  },

  validateOutput(output) {
    return typeof output?.messageId === 'string'
  },

  normalizeOutput(output) {
    return {
      messageId: output.messageId
    }
  },

  execute
}
