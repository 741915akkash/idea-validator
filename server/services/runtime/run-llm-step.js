import { generate } from '../llm/generate.js'
import { validateRuntimeResponse } from './validate-runtime-response.js'

export async function runLlmStep(state) {
  console.log('🤖 Calling LLM...')
  console.log({
    provider: state.run.llm.provider,
    model: state.run.llm.model,
    messages: state.messages.length
  })

  const startedAt = performance.now()

  const response = await generate({
    messages: state.messages
  })

  state.run.llm.rawResponses.push(response.text)

  const latencyMs = performance.now() - startedAt

  state.run.llm.calls += 1

  state.run.llm.provider = response.run.provider
  state.run.llm.model = response.run.model

  state.run.llm.promptTokens += response.run.promptTokens
  state.run.llm.completionTokens += response.run.completionTokens
  state.run.llm.totalTokens += response.run.totalTokens
  state.run.llm.costUsd += response.run.costUsd ?? 0
  state.run.llm.latencyMs += latencyMs

  console.log('✅ LLM Complete')
  console.log({
    latencyMs: Math.round(latencyMs),
    promptTokens: response.run.promptTokens,
    completionTokens: response.run.completionTokens,
    totalTokens: response.run.totalTokens
  })

  console.log('================ RAW LLM RESPONSE ================')
  console.log(response.text)
  console.log('==================================================')

  const runtimeResponse = validateRuntimeResponse(response.text)

  console.log('LLM Action')
  console.log(runtimeResponse.action)

  state.messages.push({
    role: 'assistant',
    content: JSON.stringify(runtimeResponse)
  })

  return runtimeResponse
}
