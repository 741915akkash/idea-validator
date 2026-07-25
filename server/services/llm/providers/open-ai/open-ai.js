import OpenAI from 'openai'
import { LLM_CONFIG } from '../../../../config/llm.js'
import { normalizeResponse, normalizeError } from '../shared.js'

const client = new OpenAI({
  apiKey: LLM_CONFIG.apiKey
})

export async function generate({ messages }) {
  try {
    const response = await client.responses.create({
      model: LLM_CONFIG.model,
      temperature: LLM_CONFIG.temperature,
      input: messages
    })

    return normalizeResponse(response, 'openai', LLM_CONFIG.model)
  } catch (error) {
    return normalizeError(error, 'openai', LLM_CONFIG.model)
  }
}
