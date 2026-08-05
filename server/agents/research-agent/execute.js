import { buildContext } from './build-context.js'
import { compressContext } from './compress-context.js'
import { buildPrompt } from './build-prompt.js'
import { parseAgentOutput } from '../shared/parse-agent-output.js'
import { buildPrompt as buildSharedPrompt } from '../shared/build-agent-prompt.js'
import { createAgent } from '../shared/create-agent.js'
import { buildRuntimeMessages } from '../../services/runtime/build-runtime-messages.js'

async function execute(agentContext ) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 Research Agent Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  console.log('1️⃣ Building context...')

  const { agent } = agentContext
  console.log(`Agent: ${agent.id} v${agent.version} - ${agent.name}`)

  const context = await buildContext(agentContext)

  console.log('Agent Context built')
  console.log({
    quizAnswers: context.quiz.quizAnswers.length,
    existingResearch: context.existingResearch.length
  })

  console.log('2️⃣ Compressing context...')

  const compressedContext = await compressContext(context)

  console.log('Context compressed')

  console.log('3️⃣ Building prompt...')

  const promptData = await buildPrompt(compressedContext)

  const prompt = buildSharedPrompt({
    system: promptData.system,
    user: promptData.user,
    allowedArtifacts: agent.contract.producesArtifacts,
    allowedTools: agent.contract.tools
  })

  console.log(' FULL Prompt')
  console.log(prompt)

  console.log('===============================================')

  console.log('✅ Research Agent Ready')

  return {
    messages: buildRuntimeMessages({
      system: prompt.system,
      user: prompt.user
    })
  }
}

export default createAgent({
  id: 'research',

  version: 1,

  name: 'Research Agent',

  description: 'Analyze markets, competitors and startup opportunities.',

  contract: {
    requiresContext: ['workspace', 'quiz'],

    requiresArtifacts: [
      'market-analysis',
      'competitor-analysis',
      'customer-persona',
      'customer-pain',
      'market-opportunity',
      'major-risk',
      'insight'
    ],

    producesArtifacts: [
      'market-research',
    ],

    tools: ['google-search', 'browser', 'rss']
  },

  execute
})
