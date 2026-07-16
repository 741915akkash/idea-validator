import calculator from './calculator/index.js'
import googleSearch from './google-search/index.js'
import browser from './browser/index.js'
import rss from './rss-fetcher/index.js'

const registry = {
  [calculator.id]: calculator,

  [googleSearch.id]: googleSearch,

  [browser.id]: browser,

  [rss.id]: rss
}

export default registry
