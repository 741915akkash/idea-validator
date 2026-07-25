import { createArtifact } from './create-artifact.js'
import { ARTIFACT_LIFECYCLE } from './constants.js'

export default createArtifact({
  id: 'market-opportunity',

  lifecycle: ARTIFACT_LIFECYCLE.VERSIONED,

  description: 'A concrete market opportunity, including why it exists and how the startup could pursue it.'
})
