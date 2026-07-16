import runTool from '../../services/tools/run-tool.js'

export default async function execute({ input, context }) {
  try {
    switch (input.action) {
      case 'search':
        return await search(input.input, context)

      case 'post':
        return await post(input.input, context)

      case 'profile':
        return await profile(input.input, context)

      default:
        return {
          success: false,

          warning: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown X action "${input.action}".`
          }
        }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'X_FAILED',
        message: error.message
      }
    }
  }
}

async function search(input, context) {
  const result = await runTool({
    toolId: 'google-search',

    input: {
      query: `site:x.com ${input.query}`
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

async function post(input, context) {
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

async function profile(input, context) {
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
