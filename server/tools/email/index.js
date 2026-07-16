import execute from './execute.js'

export default {
  id: 'email',

  version: 1,

  name: 'Email',

  description: 'Send an email.',

  inputSchema: {
    to: {
      type: 'array',
      required: true
    },

    cc: {
      type: 'array',
      required: false
    },

    bcc: {
      type: 'array',
      required: false
    },

    subject: {
      type: 'string',
      required: true
    },

    body: {
      type: 'string',
      required: true
    },

    html: {
      type: 'boolean',
      required: false
    }
  },

  outputSchema: {
    messageId: {
      type: 'string',
      required: true
    }
  },

  validateInput(input) {
    return (
      Array.isArray(input?.to) &&
      typeof input?.subject === 'string' &&
      typeof input?.body === 'string'
    )
  },

  normalizeInput(input) {
    return {
      to: input.to ?? [],
      cc: input.cc ?? [],
      bcc: input.bcc ?? [],
      subject: input.subject.trim(),
      body: input.body,
      html: input.html ?? false
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
