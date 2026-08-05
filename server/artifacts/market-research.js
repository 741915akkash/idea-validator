import { createArtifact } from './create-artifact.js'
import { ARTIFACT_LIFECYCLE } from './constants.js'

export default createArtifact({
  id: 'market-research',

  lifecycle: ARTIFACT_LIFECYCLE.VERSIONED,

  description: 'Research on the market, industry, trends, customers and supporting evidence.'
})
