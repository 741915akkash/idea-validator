import { createHash } from 'node:crypto'

function normalizePart(value) {
  return String(value || '').trim().toLowerCase()
}

function formatAsUuidFromHex(hex) {
  const chars = hex.slice(0, 32).split('')

  // RFC-4122 variant + version markers so Postgres accepts canonical UUID form.
  chars[12] = '5'
  chars[16] = '8'

  const s = chars.join('')
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`
}

export function buildCreditReferenceId(parts = []) {
  const seed = parts.map((part) => normalizePart(part)).join('|')
  const digest = createHash('sha256').update(seed).digest('hex')
  return formatAsUuidFromHex(digest)
}
