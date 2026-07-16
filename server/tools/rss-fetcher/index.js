import execute from './execute.js'

export default {
  id: 'rss',

  version: 1,

  name: 'RSS',

  description: 'Read and parse an RSS or Atom feed.',

  inputSchema: {
    url: {
      type: 'string',
      required: true
    }
  },

  outputSchema: {
    feed: {
      type: 'object',
      required: true
    },

    items: {
      type: 'array',
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
    return output?.feed && typeof output.feed === 'object' && Array.isArray(output.items)
  },

  normalizeOutput(output) {
    return {
      feed: output.feed ?? {},
      items: output.items ?? []
    }
  },

  execute
}
