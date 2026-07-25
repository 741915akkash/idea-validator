import { createArtifact } from './create-artifact.js'
import { ARTIFACT_LIFECYCLE } from './constants.js'

export default createArtifact({
  id: 'major-risk',

  lifecycle: ARTIFACT_LIFECYCLE.VERSIONED,

  description: 'A major startup risk, including impact, likelihood, assumptions and validation steps.'
})
