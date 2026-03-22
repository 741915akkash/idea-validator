function readHeader(headers, name) {
  const value = headers?.[name]
  if (Array.isArray(value)) return String(value[0] || '')
  return String(value || '')
}

export function getClientIP(event) {
  const headers = event?.node?.req?.headers || {}
  const cfConnectingIp = readHeader(headers, 'cf-connecting-ip').trim()
  if (cfConnectingIp) return cfConnectingIp

  const xForwardedFor = readHeader(headers, 'x-forwarded-for')
    .split(',')[0]
    .trim()
  if (xForwardedFor) return xForwardedFor

  return event?.node?.req?.socket?.remoteAddress || ''
}
