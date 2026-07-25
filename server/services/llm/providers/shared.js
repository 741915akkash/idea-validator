export function normalizeResponse(response, provider, model, costUsd = null) {
  const message = response?.choices?.[0]?.message ?? {}

  if (!message) {
    throw new Error('LLM response did not contain choices[0].message')
  }

  const promptTokens = response?.usage?.prompt_tokens ?? 0
  const completionTokens = response?.usage?.completion_tokens ?? 0
  const totalTokens = response?.usage?.total_tokens ?? promptTokens + completionTokens

  return {
    text: message.content ?? '',

    reasoning: message.reasoning ?? null,

    run: {
      success: true,

      provider,

      model,

      promptTokens,

      completionTokens,

      totalTokens,

      costUsd,

      error: null
    }
  }
}

export function normalizeError(error, provider, model) {
  return {
    text: '',

    run: {
      success: false,

      provider,

      model,

      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,

      costUsd: null,

      error: error.message
    }
  }
}
