import { createArtifact } from './create-artifact.js'
import { ARTIFACT_LIFECYCLE } from './constants.js'

export default createArtifact({
  id: 'customer-persona',

  lifecycle: ARTIFACT_LIFECYCLE.VERSIONED,

  description: 'A target customer segment or persona, including needs, context and buying behavior.'
})
