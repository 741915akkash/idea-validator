import { getHeader, setResponseStatus } from 'h3'

const HEALTH_PATHS = new Set(['/health', '/healthz', '/ready', '/readyz'])
const INTERNAL_ALLOWED_PREFIXES = ['/__nuxt_content/', '/_nuxt/']
const INTERNAL_ALLOWED_PATHS = new Set(['/__nuxt_error'])

export default defineEventHandler((event) => {
  const originSecret = String(process.env.ORIGIN_SECRET || '')

  // Disabled unless explicitly configured in env.
  if (!originSecret) return

  const path = String(event.path || '')
  if (HEALTH_PATHS.has(path)) return
  if (INTERNAL_ALLOWED_PATHS.has(path)) return
  if (INTERNAL_ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))) return

  const headerSecret = String(getHeader(event, 'x-origin-secret') || '')
  if (headerSecret === originSecret) return

  setResponseStatus(event, 403)
  return {
    statusCode: 403,
    statusMessage: 'Forbidden'
  }
})
