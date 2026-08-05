import {
  googleSearchFailed,
  googleSearchNotConfigured
} from '../tool-errors.js'

export default async function execute({ input, context }) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  if (!apiKey || !searchEngineId) {
    return googleSearchNotConfigured()
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: input.query
  })

  try {
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`)

    if (!response.ok) {
      return googleSearchFailed(
        `Google Search returned ${response.status}.`
      )
    }

    const data = await response.json()

    return {
      success: true,
      output: {
        results: (data.items ?? []).map((item) => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet
        }))
      },
      metadata: {
        cost: {
          amount: 0.005, // replace with actual calculated cost if available
          currency: 'USD'
        }
      }
    }
  } catch (error) {
    return googleSearchFailed(error.message)
  }
}
