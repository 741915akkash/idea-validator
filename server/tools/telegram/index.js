import execute from './execute.js'

export default {
  id: 'telegram',

  version: 1,

  name: 'Telegram',

  description: 'Send a Telegram message using the Telegram Bot API.',

  inputSchema: {
    chatId: {
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
      type: 'number',
      required: true
    }
  },

  validateInput(input) {
    return typeof input?.chatId === 'string' && typeof input?.message === 'string'
  },

  normalizeInput(input) {
    return {
      chatId: input.chatId.trim(),
      message: input.message.trim()
    }
  },

  validateOutput(output) {
    return typeof output?.messageId === 'number'
  },

  normalizeOutput(output) {
    return {
      messageId: output.messageId
    }
  },

  execute
}
