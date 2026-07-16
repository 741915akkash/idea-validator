export default async function execute({ input, context }) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  if (!apiKey || !searchEngineId) {
    return {
      success: false,
      warning: {
        code: 'GOOGLE_SEARCH_NOT_CONFIGURED',
        message: 'Google Search credentials are missing.'
      }
    }
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: input.query
  })

  try {
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`)

    if (!response.ok) {
      return {
        success: false,
        warning: {
          code: 'GOOGLE_SEARCH_FAILED',
          message: `Google Search returned ${response.status}.`
        }
      }
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
      }
    }
  } catch (error) {
    return {
      success: false,
      warning: {
        code: 'GOOGLE_SEARCH_FAILED',
        message: error.message
      }
    }
  }
}
