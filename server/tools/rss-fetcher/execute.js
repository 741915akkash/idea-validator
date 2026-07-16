import Parser from 'rss-parser'

const parser = new Parser()

export default async function execute({ input, context }) {
  try {
    const feed = await parser.parseURL(input.url)

    return {
      success: true,

      output: {
        feed: {
          title: feed.title,
          description: feed.description,
          link: feed.link
        },

        items: (feed.items ?? []).map((item) => ({
          title: item.title ?? '',
          url: item.link ?? '',
          snippet: item.contentSnippet ?? '',
          publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : null
        }))
      }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'RSS_FETCH_FAILED',
        message: error.message
      }
    }
  }
}
