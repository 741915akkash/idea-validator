import marketAnalysis from './market-analysis.js'
import competitorAnalysis from './competitor-analysis.js'
import insight from './insight.js'

const registry = {
  [marketAnalysis.id]: marketAnalysis,

  [competitorAnalysis.id]: competitorAnalysis,

  [insight.id]: insight
}

export default registry
