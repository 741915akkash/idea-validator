import fs from 'node:fs/promises'
import path from 'node:path'
import {
  unknownAction,
  fileFailed
} from '../tool-errors.js'

export default async function execute({ input, context }) {
  try {
    switch (input.action) {
      case 'read':
        return await read(input.input)

      case 'write':
        return await write(input.input)

      case 'append':
        return await append(input.input)

      case 'copy':
        return await copy(input.input)

      case 'move':
        return await move(input.input)

      case 'delete':
        return await remove(input.input)

      case 'exists':
        return await exists(input.input)

      case 'metadata':
        return await metadata(input.input)

      case 'list':
        return await list(input.input)

      default:
        return unknownAction(input.action)
    }
  } catch (error) {
    return fileFailed(error.message)
  }
}

async function read(input) {
  const content =
    input.encoding === 'buffer'
      ? await fs.readFile(input.path)
      : await fs.readFile(input.path, input.encoding)

  return {
    success: true,
    output: {
      data: {
        path: input.path,
        content
      }
    }
  }
}

async function write(input) {
  await fs.writeFile(
    input.path,
    input.content,
    input.encoding === 'buffer' ? undefined : input.encoding
  )

  return {
    success: true,
    output: {
      data: {
        path: input.path
      }
    }
  }
}

async function append(input) {
  await fs.appendFile(
    input.path,
    input.content,
    input.encoding === 'buffer' ? undefined : input.encoding
  )

  return {
    success: true,
    output: {
      data: {
        path: input.path
      }
    }
  }
}

async function copy(input) {
  await fs.copyFile(input.source, input.destination)

  return {
    success: true,
    output: {
      data: {
        source: input.source,
        destination: input.destination
      }
    }
  }
}

async function move(input) {
  await fs.rename(input.source, input.destination)

  return {
    success: true,
    output: {
      data: {
        source: input.source,
        destination: input.destination
      }
    }
  }
}

async function remove(input) {
  await fs.rm(input.path)

  return {
    success: true,
    output: {
      data: {
        path: input.path
      }
    }
  }
}

async function exists(input) {
  try {
    await fs.access(input.path)

    return {
      success: true,
      output: {
        data: {
          exists: true
        }
      }
    }
  } catch {
    return {
      success: true,
      output: {
        data: {
          exists: false
        }
      }
    }
  }
}

async function metadata(input) {
  const stats = await fs.stat(input.path)

  return {
    success: true,
    output: {
      data: {
        path: input.path,
        name: path.basename(input.path),
        extension: path.extname(input.path),
        size: stats.size,
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile()
      }
    }
  }
}

async function list(input) {
  const entries = await fs.readdir(input.path, {
    withFileTypes: true
  })

  return {
    success: true,
    output: {
      data: {
        path: input.path,
        files: entries.map((entry) => ({
          name: entry.name,
          path: path.join(input.path, entry.name),
          isDirectory: entry.isDirectory(),
          isFile: entry.isFile()
        }))
      }
    }
  }
}
