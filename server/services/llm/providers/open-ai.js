import OpenAI from 'openai'
import { LLM_CONFIG } from '../../../config/llm.js'
import { normalizeResponse } from './shared.js'


const client = new OpenAI({
  apiKey: LLM_CONFIG.apiKey
})

export async function generate({ system, user }) {
  try {
    const response = await client.responses.create({
      model: LLM_CONFIG.model,
      temperature: LLM_CONFIG.temperature,
      input: [
        {
          role: 'system',
          content: system
        },
        {
          role: 'user',
          content: user
        }
      ]
    })

    return normalizeResponse(response, 'openai', LLM_CONFIG.model)
  } catch (error) {
    return normalizeError(error, 'openai', LLM_CONFIG.model)
  }
}