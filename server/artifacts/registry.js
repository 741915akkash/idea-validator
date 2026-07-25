import marketAnalysis from './market-analysis.js'
import competitorAnalysis from './competitor-analysis.js'
import insight from './insight.js'
import customerPersona from './customer-persona.js'
import customerPain from './customer-pain.js'
import marketOpportunity from './market-opportunity.js'
import majorRisk from './major-risk.js'

const registry = {
  [marketAnalysis.id]: marketAnalysis,

  [competitorAnalysis.id]: competitorAnalysis,

  [insight.id]: insight,

  [customerPersona.id]: customerPersona,

  [customerPain.id]: customerPain,

  [marketOpportunity.id]: marketOpportunity,

  [majorRisk.id]: majorRisk
}

export default registry
