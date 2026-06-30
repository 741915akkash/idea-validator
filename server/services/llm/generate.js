import providers from './providers/registry.js'
import { LLM_CONFIG } from '../../config/llm.js'

export async function generate(prompt) {
  console.log('LLM CONFIG')
  console.log(LLM_CONFIG)

  const provider = providers[LLM_CONFIG.provider]

  if (!provider) {
    throw new Error(`Unknown LLM provider: ${LLM_CONFIG.provider}`)
  }

  return provider.generate(prompt)
}
