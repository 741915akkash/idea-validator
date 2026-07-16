import { marked } from 'marked'
import TurndownService from 'turndown'
import markdownToc from 'markdown-toc'

import runTool from '../../services/tools/run-tool.js'

const turndown = new TurndownService()

export default async function execute({ input, context }) {
  try {
    switch (input.action) {
      case 'read':
        return await read(input.input, context)

      case 'write':
        return await write(input.input, context)

      case 'to-html':
        return await toHtml(input.input)

      case 'from-html':
        return await fromHtml(input.input)

      case 'strip':
        return await strip(input.input)

      case 'toc':
        return await toc(input.input)

      default:
        return {
          success: false,

          warning: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown Markdown action "${input.action}".`
          }
        }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'MARKDOWN_FAILED',
        message: error.message
      }
    }
  }
}

async function read(input, context) {
  const file = await runTool({
    toolId: 'file',

    input: {
      action: 'read',

      input: {
        path: input.path,
        encoding: 'utf8'
      }
    },

    context
  })

  if (!file.success) {
    return file
  }

  return {
    success: true,

    output: {
      data: {
        path: input.path,
        markdown: file.output.data.content
      }
    }
  }
}

async function write(input, context) {
  const file = await runTool({
    toolId: 'file',

    input: {
      action: 'write',

      input: {
        path: input.path,
        content: input.markdown ?? '',
        encoding: 'utf8'
      }
    },

    context
  })

  if (!file.success) {
    return file
  }

  return {
    success: true,

    output: {
      data: {
        path: input.path
      }
    }
  }
}

async function toHtml(input) {
  return {
    success: true,

    output: {
      data: {
        html: marked.parse(input.markdown ?? '')
      }
    }
  }
}

async function fromHtml(input) {
  return {
    success: true,

    output: {
      data: {
        markdown: turndown.turndown(input.html ?? '')
      }
    }
  }
}

async function strip(input) {
  const html = marked.parse(input.markdown ?? '')

  const text = html.replace(/<[^>]+>/g, '').trim()

  return {
    success: true,

    output: {
      data: {
        text
      }
    }
  }
}

async function toc(input) {
  const result = markdownToc(input.markdown ?? '')

  return {
    success: true,

    output: {
      data: {
        toc: result.json
      }
    }
  }
}
