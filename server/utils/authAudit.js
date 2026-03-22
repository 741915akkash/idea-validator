import crypto from 'crypto'
import { getClientIP } from './clientIp'

function hashEmail(email) {
  return crypto.createHash('sha256').update(String(email || '')).digest('hex')
}

export function logAuthEvent(event, type, details = {}) {
  const ip = getClientIP(event) || 'unknown'
  const userAgent = event.node?.req?.headers?.['user-agent'] || ''
  const requestId = event.node?.req?.headers?.['x-request-id'] || ''
  const emailHash = details.email ? hashEmail(details.email) : undefined

  const payload = {
    type,
    ip,
    userAgent,
    requestId,
    emailHash,
    ...details
  }

  if (payload.email) delete payload.email
  console.info('[auth][event]', JSON.stringify(payload))
}
