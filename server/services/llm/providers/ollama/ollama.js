import axios from 'axios'
import { LLM_CONFIG } from '../../../../config/llm.js'
import { normalizeResponse } from '../shared.js'
import * as conversation from './conversation-adapter-gemma.js'

export { conversation }

export async function generate({ messages }) {
  try {
    console.log('================ REQUEST MESSAGES ================')
    // console.dir(messages, { depth: null })
    console.log('==================================================')

    const body = {
      model: LLM_CONFIG.model,
      temperature: LLM_CONFIG.temperature,
      messages,
      stream: false
    }

    console.log('================ REQUEST BODY ================')
    console.dir(body, { depth: null })
    console.log('==============================================')

    const startedAt = performance.now()

    const response = await axios.post(`${LLM_CONFIG.baseUrl}/chat/completions`, body, {
      headers: {
        'Content-Type': 'application/json'
      },

      // AI requests can legitimately take minutes.
      timeout: 0,

      validateStatus: () => true
    })

    const latencyMs = performance.now() - startedAt

    console.log(`HTTP ${response.status}`)
    console.log(`Network Latency: ${Math.round(latencyMs)}ms`)

    console.log('================ RAW OLLAMA RESPONSE ================')
    console.dir(response.data, { depth: null })
    console.log('=====================================================')

    if (response.status >= 400) {
      throw new Error(
        response.data?.error?.message ??
          response.data?.error ??
          `Ollama request failed (${response.status})`
      )
    }

    console.log('Finish Reason:', response.data.choices?.[0]?.finish_reason)
    console.log('Message:', response.data.choices?.[0]?.message)

    return normalizeResponse(response.data, 'ollama', LLM_CONFIG.model)
  } catch (error) {
    console.error('OLLAMA ERROR')
    console.dir(error, { depth: null })

    throw error
  }
}
