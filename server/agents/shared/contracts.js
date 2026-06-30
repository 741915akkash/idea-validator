export const EMPTY_AGENT_RESULT = {
  artifacts: [],
  tasks: [],
  warnings: [],

  run: {
    success: true,

    provider: null,
    model: null,

    durationMs: null,

    promptTokens: null,
    completionTokens: null,
    totalTokens: null,

    costUsd: null,

    error: null
  }
}
