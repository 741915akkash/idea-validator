import execute from './execute.js'

export default {
  id: 'browser',

  version: 1,

  name: 'Browser',

  description: 'Open a web page using Playwright and extract its content.',

  inputSchema: {
    url: {
      type: 'string',
      required: true
    }
  },

  outputSchema: {
    url: {
      type: 'string',
      required: true
    },

    title: {
      type: 'string',
      required: true
    },

    html: {
      type: 'string',
      required: true
    },

    text: {
      type: 'string',
      required: true
    }
  },

  validateInput(input) {
    return typeof input?.url === 'string'
  },

  normalizeInput(input) {
    return {
      url: input.url.trim()
    }
  },

  validateOutput(output) {
    return (
      typeof output?.url === 'string' &&
      typeof output?.title === 'string' &&
      typeof output?.html === 'string' &&
      typeof output?.text === 'string'
    )
  },

  normalizeOutput(output) {
    return {
      url: output.url ?? '',
      title: output.title ?? '',
      html: output.html ?? '',
      text: output.text ?? ''
    }
  },

  execute
}
