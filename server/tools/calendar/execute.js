import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/calendar']
})

const calendar = google.calendar({
  version: 'v3',
  auth
})

export default async function execute({ input, context }) {
  try {
    switch (input.action) {
      case 'create-event':
        return await createEvent(input.input)

      case 'update-event':
        return await updateEvent(input.input)

      case 'delete-event':
        return await deleteEvent(input.input)

      case 'get-event':
        return await getEvent(input.input)

      case 'list-events':
        return await listEvents(input.input)

      default:
        return {
          success: false,

          warning: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown Calendar action "${input.action}".`
          }
        }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'CALENDAR_FAILED',
        message: error.message
      }
    }
  }
}

async function createEvent(input) {
  const response = await calendar.events.insert({
    calendarId: input.calendarId ?? 'primary',

    requestBody: {
      summary: input.summary,
      description: input.description,
      location: input.location,

      start: {
        dateTime: input.start
      },

      end: {
        dateTime: input.end
      },

      attendees: (input.attendees ?? []).map((email) => ({ email }))
    }
  })

  return {
    success: true,

    output: {
      data: response.data
    }
  }
}

async function updateEvent(input) {
  const response = await calendar.events.patch({
    calendarId: input.calendarId ?? 'primary',

    eventId: input.eventId,

    requestBody: input.updates
  })

  return {
    success: true,

    output: {
      data: response.data
    }
  }
}

async function deleteEvent(input) {
  await calendar.events.delete({
    calendarId: input.calendarId ?? 'primary',

    eventId: input.eventId
  })

  return {
    success: true,

    output: {
      data: {
        eventId: input.eventId
      }
    }
  }
}

async function getEvent(input) {
  const response = await calendar.events.get({
    calendarId: input.calendarId ?? 'primary',

    eventId: input.eventId
  })

  return {
    success: true,

    output: {
      data: response.data
    }
  }
}

async function listEvents(input) {
  const response = await calendar.events.list({
    calendarId: input.calendarId ?? 'primary',

    timeMin: input.timeMin,
    timeMax: input.timeMax,
    maxResults: input.maxResults ?? 20,
    singleEvents: true,
    orderBy: 'startTime'
  })

  return {
    success: true,

    output: {
      data: {
        events: response.data.items ?? []
      }
    }
  }
}
