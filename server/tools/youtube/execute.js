import runTool from '../../services/tools/run-tool.js'

export default async function execute({ input, context }) {
  try {
    switch (input.action) {
      case 'search':
        return await search(input.input, context)

      case 'video':
        return await video(input.input, context)

      case 'channel':
        return await channel(input.input, context)

      default:
        return {
          success: false,

          warning: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown YouTube action "${input.action}".`
          }
        }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'YOUTUBE_FAILED',
        message: error.message
      }
    }
  }
}

async function search(input, context) {
  const result = await runTool({
    toolId: 'google-search',

    input: {
      query: `site:youtube.com ${input.query}`
    },

    context
  })

  if (!result.success) {
    return result
  }

  return {
    success: true,

    output: {
      data: {
        results: result.output.results
      }
    }
  }
}

async function video(input, context) {
  const browser = await runTool({
    toolId: 'browser',

    input: {
      url: input.url
    },

    context
  })

  if (!browser.success) {
    return browser
  }

  return {
    success: true,

    output: {
      data: {
        url: browser.output.url,
        title: browser.output.title,
        text: browser.output.text,
        html: browser.output.html
      }
    }
  }
}

async function channel(input, context) {
  const browser = await runTool({
    toolId: 'browser',

    input: {
      url: input.url
    },

    context
  })

  if (!browser.success) {
    return browser
  }

  return {
    success: true,

    output: {
      data: {
        url: browser.output.url,
        title: browser.output.title,
        text: browser.output.text,
        html: browser.output.html
      }
    }
  }
}
