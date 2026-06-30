export function normalizeResponse(response, provider, model, costUsd = null) {
  return {
    text: response.choices[0].message.content ?? '',

    run: {
      success: true,

      provider,

      model,

      promptTokens: response.usage?.prompt_tokens ?? 0,

      completionTokens: response.usage?.completion_tokens ?? 0,

      totalTokens: response.usage?.total_tokens ?? 0,

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