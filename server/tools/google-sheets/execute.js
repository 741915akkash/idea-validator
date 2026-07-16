import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
})

const sheets = google.sheets({
  version: 'v4',
  auth
})

export default async function execute({ input, context }) {
  try {
    switch (input.action) {
      case 'read':
        return await read(input.input)

      case 'write':
        return await write(input.input)

      case 'append':
        return await append(input.input)

      case 'clear':
        return await clear(input.input)

      case 'metadata':
        return await metadata(input.input)

      default:
        return {
          success: false,

          warning: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown Google Sheets action "${input.action}".`
          }
        }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'GOOGLE_SHEETS_FAILED',
        message: error.message
      }
    }
  }
}

async function read(input) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: input.spreadsheetId,
    range: input.range
  })

  return {
    success: true,

    output: {
      data: {
        values: response.data.values ?? []
      }
    }
  }
}

async function write(input) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: input.spreadsheetId,
    range: input.range,
    valueInputOption: input.valueInputOption ?? 'RAW',

    requestBody: {
      values: input.values
    }
  })

  return {
    success: true,

    output: {
      data: {
        spreadsheetId: input.spreadsheetId,
        range: input.range
      }
    }
  }
}

async function append(input) {
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: input.spreadsheetId,
    range: input.range,
    valueInputOption: input.valueInputOption ?? 'RAW',

    requestBody: {
      values: input.values
    }
  })

  return {
    success: true,

    output: {
      data: {
        updates: response.data.updates
      }
    }
  }
}

async function clear(input) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId: input.spreadsheetId,
    range: input.range
  })

  return {
    success: true,

    output: {
      data: {
        spreadsheetId: input.spreadsheetId,
        range: input.range
      }
    }
  }
}

async function metadata(input) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: input.spreadsheetId
  })

  return {
    success: true,

    output: {
      data: {
        spreadsheetId: response.data.spreadsheetId,
        title: response.data.properties?.title,
        sheets: (response.data.sheets ?? []).map((sheet) => ({
          sheetId: sheet.properties.sheetId,
          title: sheet.properties.title,
          index: sheet.properties.index
        }))
      }
    }
  }
}
