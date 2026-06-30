import OpenAI from 'openai'
import { LLM_CONFIG } from '../../../config/llm.js'
import { normalizeResponse, normalizeError } from './shared.js'

const client = new OpenAI({
  apiKey: LLM_CONFIG.apiKey || 'ollama',

  baseURL: LLM_CONFIG.baseUrl
})

export async function generate({ system, user }) {
  try {
    const response = await client.chat.completions.create({
      model: LLM_CONFIG.model,
      temperature: LLM_CONFIG.temperature,
      messages: [
        {
          role: 'system',
          content: system
        },
        {
          role: 'user',
          content: user
        }
      ],
      extra_body: {
        think: LLM_CONFIG.think
      }
    })

    return normalizeResponse(response, 'ollama', LLM_CONFIG.model)
  } catch (error) {
    return normalizeError(error, 'ollama', LLM_CONFIG.model)
  }
}
