import calculator from './calculator/index.js'
import googleSearch from './google-search/index.js'
import browser from './browser/index.js'
import rss from './rss-fetcher/index.js'
import { validateTool } from './tool-contract.js'

const registry = {
  [calculator.id]: calculator,

  [googleSearch.id]: googleSearch,

  [browser.id]: browser,

  [rss.id]: rss
}

for (const tool of Object.values(registry)) {
  validateTool(tool)
}

export default registry
