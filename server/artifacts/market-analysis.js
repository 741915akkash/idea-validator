import { createArtifact } from './create-artifact.js'
import { ARTIFACT_LIFECYCLE } from './constants.js'

export default createArtifact({
  id: 'market-analysis',

  lifecycle: ARTIFACT_LIFECYCLE.VERSIONED,

  description:
    'Analysis of the startup market, including market size, trends, customer demand and opportunities.'
})
