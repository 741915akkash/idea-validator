import crypto from 'crypto'
import { OTP_TTL_MIN } from '../../utils/auth'

function buildMessage(code, expiresMinutes) {
  return {
    subject: 'Your Idea Validator login code',
    text: `Your Idea Validator login code:\n\n${code}\n\nThis code expires in ${expiresMinutes} minutes.`
  }
}

async function sendViaResend({ to, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || process.env.OTP_FROM_EMAIL

  if (!apiKey || !from) {
    throw new Error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL/OTP_FROM_EMAIL')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text
    })
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend send failed (${response.status}): ${body}`)
  }
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function hmac(key, value, encoding) {
  return crypto.createHmac('sha256', key).update(value).digest(encoding)
}

function resolveProvider() {
  const preferred = String(process.env.OTP_EMAIL_PROVIDER || '')
    .trim()
    .toLowerCase()

  if (preferred) return preferred
  if (process.env.RESEND_API_KEY) return 'resend'

  const hasSesCreds =
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    (process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION)

  if (hasSesCreds) return 'ses'
  return 'console'
}

async function sendViaSes({ to, subject, text }) {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
  const from = process.env.SES_FROM_EMAIL || process.env.OTP_FROM_EMAIL

  if (!accessKeyId || !secretAccessKey || !region || !from) {
    throw new Error('Missing SES env vars: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, SES_FROM_EMAIL/OTP_FROM_EMAIL')
  }

  const host = `email.${region}.amazonaws.com`
  const path = '/v2/email/outbound-emails'
  const endpoint = `https://${host}${path}`
  const body = JSON.stringify({
    FromEmailAddress: from,
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: text }
        }
      }
    }
  })

  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = sha256Hex(body)

  const canonicalHeaders =
    `content-type:application/json\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'
  const canonicalRequest = ['POST', path, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')
  const credentialScope = `${dateStamp}/${region}/ses/aws4_request`
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256Hex(canonicalRequest)}`

  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, 'ses')
  const kSigning = hmac(kService, 'aws4_request')
  const signature = hmac(kSigning, stringToSign, 'hex')

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Amz-Date': amzDate,
      'X-Amz-Content-Sha256': payloadHash,
      Authorization: authorization
    },
    body
  })

  if (!response.ok) {
    const responseBody = await response.text()
    throw new Error(`SES send failed (${response.status}): ${responseBody}`)
  }
}

export async function sendOtpEmail({ to, code, expiresMinutes = OTP_TTL_MIN }) {
  const provider = resolveProvider()
  const { subject, text } = buildMessage(code, expiresMinutes)

  if (provider === 'resend') {
    await sendViaResend({ to, subject, text })
    return
  }

  if (provider === 'ses') {
    await sendViaSes({ to, subject, text })
    return
  }

  console.info(`[auth][otp] provider=console to=${to} code=${code} expiresMinutes=${expiresMinutes}`)
}
