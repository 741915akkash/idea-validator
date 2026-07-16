import fs from 'node:fs'

import { google } from 'googleapis'

import runTool from '../../services/tools/run-tool.js'

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/drive']
})

const drive = google.drive({
  version: 'v3',
  auth
})

export default async function execute({ input, context }) {
  try {
    switch (input.action) {
      case 'upload':
        return await upload(input.input, context)

      case 'download':
        return await download(input.input, context)

      case 'list':
        return await list(input.input)

      case 'delete':
        return await remove(input.input)

      case 'metadata':
        return await metadata(input.input)

      case 'create-folder':
        return await createFolder(input.input)

      default:
        return {
          success: false,

          warning: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown Google Drive action "${input.action}".`
          }
        }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'GOOGLE_DRIVE_FAILED',
        message: error.message
      }
    }
  }
}

async function upload(input, context) {
  const file = await drive.files.create({
    requestBody: {
      name: input.name,
      parents: input.folderId ? [input.folderId] : undefined
    },

    media: {
      body: fs.createReadStream(input.path)
    },

    fields: 'id,name,mimeType,webViewLink'
  })

  return {
    success: true,

    output: {
      data: file.data
    }
  }
}

async function download(input, context) {
  const response = await drive.files.get(
    {
      fileId: input.fileId,
      alt: 'media'
    },
    {
      responseType: 'arraybuffer'
    }
  )

  const file = await runTool({
    toolId: 'file',

    input: {
      action: 'write',

      input: {
        path: input.path,
        content: Buffer.from(response.data),
        encoding: 'buffer'
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

async function list(input) {
  const response = await drive.files.list({
    q: input.folderId ? `'${input.folderId}' in parents` : undefined,

    fields: 'files(id,name,mimeType,webViewLink)'
  })

  return {
    success: true,

    output: {
      data: {
        files: response.data.files
      }
    }
  }
}

async function remove(input) {
  await drive.files.delete({
    fileId: input.fileId
  })

  return {
    success: true,

    output: {
      data: {
        fileId: input.fileId
      }
    }
  }
}

async function metadata(input) {
  const response = await drive.files.get({
    fileId: input.fileId,

    fields: '*'
  })

  return {
    success: true,

    output: {
      data: response.data
    }
  }
}

async function createFolder(input) {
  const response = await drive.files.create({
    requestBody: {
      name: input.name,

      mimeType: 'application/vnd.google-apps.folder',

      parents: input.parentId ? [input.parentId] : undefined
    },

    fields: 'id,name'
  })

  return {
    success: true,

    output: {
      data: response.data
    }
  }
}
