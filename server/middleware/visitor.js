import { randomUUID } from 'crypto'

export default defineEventHandler((event) => {
  let visitorId = getCookie(event, 'visitor_id')

  if (!visitorId) {
    visitorId = randomUUID()

    setCookie(event, 'visitor_id', visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365
    })
  }

  event.context.visitorId = visitorId
})
