import { ARTIFACT_LIFECYCLE } from './constants.js'

const DEFAULT_SCHEMA = {
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
}

function validate(artifact) {
  return (
    typeof artifact?.title === 'string' &&
    typeof artifact?.summary === 'string' &&
    artifact?.content &&
    typeof artifact.content === 'object'
  )
}

function normalize(artifact) {
  return {
    type: this.id,

    title: artifact.title ?? '',

    summary: artifact.summary ?? '',

    content: artifact.content ?? {}
  }
}

export function createArtifact({
  id,
  version = 1,
  lifecycle = ARTIFACT_LIFECYCLE.IMMUTABLE,
  description
}) {
  return {
    id,
    version,
    lifecycle,
    description,

    schema: DEFAULT_SCHEMA,

    validate,

    normalize
  }
}
