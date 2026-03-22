import { createError, getHeader } from 'h3'

const HEALTH_PATHS = new Set(['/health', '/healthz', '/ready', '/readyz'])

export default defineEventHandler((event) => {
  const originSecret = String(process.env.ORIGIN_SECRET || '')

  // Disabled unless explicitly configured in env.
  if (!originSecret) return

  const path = String(event.path || '')
  if (HEALTH_PATHS.has(path)) return

  const headerSecret = String(getHeader(event, 'x-origin-secret') || '')
  if (headerSecret === originSecret) return

  throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
})
