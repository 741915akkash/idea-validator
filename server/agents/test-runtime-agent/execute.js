import { buildSystemPrompt } from './system-prompt-google-search.js'
import { buildPrompt } from '../shared/build-agent-prompt.js'
import { buildRuntimeMessages } from '../../services/runtime/build-runtime-messages.js'
import { parseAgentOutput } from '../shared/parse-agent-output.js'
import { createAgent } from '../shared/create-agent.js'

async function execute({ agent }) {
  const prompt = buildPrompt({
    system: buildSystemPrompt(),
    user: 'Start runtime verification.',
    allowedArtifacts: [],
    allowedTools: agent.contract.tools
  })

  return {
    messages: buildRuntimeMessages({
      system: prompt.system,
      user: prompt.user
    }),
  }
}

export default createAgent({
  id: 'test-runtime',

  version: 1,

  name: 'Runtime Test Agent',

  description: 'Verifies the runtime execution loop.',

  contract: {
    requiresContext: [],

    requiresArtifacts: [],

    producesArtifacts: [],

    tools: ['calculator', 'google-search']
  },

  execute
})
