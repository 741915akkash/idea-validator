import { PDFDocument } from 'pdf-lib'
import pdfParse from 'pdf-parse'

import runTool from '../../services/tools/run-tool.js'

export default async function execute({ input, context }) {
  try {
    switch (input.action) {
      case 'read':
        return await readPdf(input.input, context)

      case 'write':
        return await writePdf(input.input, context)

      case 'metadata':
        return await metadata(input.input, context)

      default:
        return {
          success: false,

          warning: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown PDF action "${input.action}".`
          }
        }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'PDF_FAILED',
        message: error.message
      }
    }
  }
}

async function readPdf(input, context) {
  const file = await runTool({
    toolId: 'file',

    input: {
      action: 'read',

      input: {
        path: input.path
      }
    },

    context
  })

  if (!file.success) {
    return file
  }

  const buffer = Buffer.from(file.output.data.content)

  const pdf = await pdfParse(buffer)

  return {
    success: true,

    output: {
      data: {
        text: pdf.text,
        pages: pdf.numpages
      }
    }
  }
}

async function writePdf(input, context) {
  const pdf = await PDFDocument.create()

  const page = pdf.addPage()

  page.drawText(input.content ?? '')

  const bytes = await pdf.save()

  const file = await runTool({
    toolId: 'file',

    input: {
      action: 'write',

      input: {
        path: input.path,
        content: Buffer.from(bytes)
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

async function metadata(input, context) {
  const file = await runTool({
    toolId: 'file',

    input: {
      action: 'read',

      input: {
        path: input.path
      }
    },

    context
  })

  if (!file.success) {
    return file
  }

  const buffer = Buffer.from(file.output.data.content)

  const pdf = await PDFDocument.load(buffer)

  return {
    success: true,

    output: {
      data: {
        title: pdf.getTitle(),
        author: pdf.getAuthor(),
        subject: pdf.getSubject(),
        creator: pdf.getCreator(),
        producer: pdf.getProducer(),
        pages: pdf.getPageCount()
      }
    }
  }
}
