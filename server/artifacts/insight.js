export default {
  id: 'insight',

  version: 1,

  lifecycle: 'versioned',

  description: 'A key finding, observation or recommendation discovered during research.',

  schema: {
    title: {
      type: 'string',
      required: true
    },

    summary: {
      type: 'string',
      required: true
    },

    content: {
      type: 'object',
      required: true
    }
  },

  validate(artifact) {
    return (
      typeof artifact?.title === 'string' &&
      typeof artifact?.summary === 'string' &&
      artifact?.content &&
      typeof artifact.content === 'object'
    )
  },

  normalize(artifact) {
    return {
      type: this.id,

      title: artifact.title ?? '',

      summary: artifact.summary ?? '',

      content: artifact.content ?? {}
    }
  }
}
