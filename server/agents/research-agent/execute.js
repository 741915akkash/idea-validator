import { buildContext } from './build-context.js'
import { compressContext } from './compress-context.js'
import { buildPrompt } from './build-prompt.js'
import { parseAgentOutput } from '../shared/parse-agent-output.js'
import { generate } from '../../services/llm/generate.js'
import { buildPrompt as buildSharedPrompt } from '../shared/build-agent-prompt.js'

async function execute({ workspaceContext, agent }) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 Research Agent Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━══')

  console.log('1️⃣ Building context...')
  const context = await buildContext(workspaceContext)

  console.log('Context built')
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
    allowedArtifacts: agent.capabilities.producesArtifacts
  })

  console.log('Prompt built')
  console.log({
    systemLength: prompt.system.length,
    userLength: prompt.user.length
  })

  console.log('================ SYSTEM PROMPT ================')
  console.log(prompt.system)

  console.log('================ USER PROMPT ==================')
  console.log(prompt.user)

  console.log('===============================================')

  console.log('4️⃣ Calling LLM...')
  const response = await generate(prompt)

  console.log('================ RAW OUTPUT ================')
  console.log(response.text)
  console.log('============================================')

  console.log('LLM response received')
  console.log(response.run)

  console.log('5️⃣ Parsing output...')
  const result = parseAgentOutput(response)

  console.log('Output parsed')
  console.log({
    artifacts: result.artifacts.length,
    tasks: result.tasks.length,
    warnings: result.warnings.length
  })

  console.log('✅ Research Agent Finished')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return result
}

export default {
  id: 'research',

  version: 1,

  name: 'Research Agent',

  description: 'Analyze markets, competitors and startup opportunities.',

  capabilities: {
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
      'market-analysis',
      'competitor-analysis',
      'customer-persona',
      'customer-pain',
      'market-opportunity',
      'major-risk',
      'insight'
    ]
  },

  execute
}
