import execute from './execute.js'

export default {
  id: 'google-search',

  version: 1,

  name: 'Google Search',

  description: 'Search Google using the Google Custom Search API.',

  inputSchema: {
    query: {
      type: 'string',
      required: true
    }
  },

  outputSchema: {
    results: {
      type: 'array',
      required: true
    }
  },

  validateInput(input) {
    return typeof input?.query === 'string'
  },

  normalizeInput(input) {
    return {
      query: input.query.trim()
    }
  },

  validateOutput(output) {
    return Array.isArray(output?.results)
  },

  normalizeOutput(output) {
    return {
      results: output.results ?? []
    }
  },

  execute
}
