export const LLM_CONFIG = {
  provider: process.env.LLM_PROVIDER || 'ollama',

  model: process.env.LLM_MODEL || 'llama3.2:3b',

  temperature: Number(process.env.LLM_TEMPERATURE || 0),

  think: process.env.LLM_THINK === 'false',

  apiKey: process.env.LLM_API_KEY,

  baseUrl: process.env.LLM_BASE_URL
}
