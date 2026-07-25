import { createArtifact } from './create-artifact.js'
import { ARTIFACT_LIFECYCLE } from './constants.js'

export default createArtifact({
  id: 'customer-pain',

  lifecycle: ARTIFACT_LIFECYCLE.VERSIONED,

  description: 'A customer pain point, including severity, frequency, current alternatives and evidence.'
})
