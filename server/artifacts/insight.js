import { createArtifact } from './create-artifact.js'
import { ARTIFACT_LIFECYCLE } from './constants.js'

export default createArtifact({
  id: 'insight',

  lifecycle: ARTIFACT_LIFECYCLE.VERSIONED,

  description: 'A key finding, observation or recommendation discovered during research.'
})
