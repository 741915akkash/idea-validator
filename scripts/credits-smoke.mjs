#!/usr/bin/env node

// Step 2 done.

// Implemented:
// - Smoke-check runner script: [credits-smoke.mjs](/home/akash/projects/idea-validator/scripts/credits-smoke.mjs)
// - NPM command: `npm run credits:smoke` in [package.json](/home/akash/projects/idea-validator/package.json)
// - Deterministic forced-failure hook (non-prod only) via `x-credits-smoke-fail: 1` in [structuredValidation.js](/home/akash/projects/idea-validator/server/services/llm/structuredValidation.js)

// What the script validates:
// 1. Cache hit => no extra charge on second identical call
// 2. Cache miss => exactly one charge
// 3. Forced failure after charge => one debit + one refund

// Also already in place for logs/refunds:
// - Structured spend/refund logs and refund function in [credits.js](/home/akash/projects/idea-validator/server/services/credits.js)

// How to run:
// - Ensure billing is enabled for smoke:
//   - `CREDITS_ENABLED=true`
// - Run with session cookie:
//   - `npm run credits:smoke -- --cookie "session_id=YOUR_SESSION_ID"`

// Proceed to Step 3 (daily DB sanity query script for debits/refunds/net)?








import crypto from 'node:crypto'

function parseArgs(argv) {
  const args = {
    baseUrl: process.env.SMOKE_BASE_URL || 'http://localhost:3000',
    cookie: process.env.SMOKE_COOKIE || '',
    endpoint: process.env.SMOKE_ENDPOINT || '/api/uncertainty/generate',
    eventsEndpoint: process.env.SMOKE_EVENTS_ENDPOINT || '/api/credits/events',
    feature: process.env.SMOKE_FEATURE || 'structured_validation_run'
  }

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i]
    const value = argv[i + 1]
    if (!key.startsWith('--')) continue
    if (value == null || value.startsWith('--')) continue

    if (key === '--base-url') args.baseUrl = value
    if (key === '--cookie') args.cookie = value
    if (key === '--endpoint') args.endpoint = value
    if (key === '--events-endpoint') args.eventsEndpoint = value
    if (key === '--feature') args.feature = value
  }

  return args
}

function headers(cookie, extra = {}) {
  return {
    'content-type': 'application/json',
    ...(cookie ? { cookie } : {}),
    ...extra
  }
}

function uniqueText(prefix) {
  return `${prefix} ${new Date().toISOString()} ${crypto.randomUUID()}`
}

async function callJson({ baseUrl, path, method = 'GET', cookie = '', body = null, extraHeaders = {} }) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: headers(cookie, extraHeaders),
    body: body == null ? undefined : JSON.stringify(body)
  })

  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { raw: text }
  }

  return {
    status: res.status,
    ok: res.ok,
    data: json
  }
}

function debitCount(events, feature) {
  return (events || []).filter((e) => e.feature === feature && Number(e.amount) < 0).length
}

function refundCount(events, feature) {
  return (events || []).filter((e) => e.feature === feature && Number(e.amount) > 0).length
}

async function getEvents({ baseUrl, eventsEndpoint, cookie }) {
  const res = await callJson({
    baseUrl,
    path: `${eventsEndpoint}?limit=200`,
    cookie
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch credit events: status=${res.status} body=${JSON.stringify(res.data)}`)
  }

  return res.data?.events || []
}

async function run() {
  const args = parseArgs(process.argv)

  if (!args.cookie) {
    console.error('Missing session cookie. Pass --cookie "session_id=..." or set SMOKE_COOKIE.')
    process.exit(1)
  }

  console.log('[smoke] config', JSON.stringify({
    baseUrl: args.baseUrl,
    endpoint: args.endpoint,
    eventsEndpoint: args.eventsEndpoint,
    feature: args.feature
  }))

  // Check 1: cache hit should not charge (second identical call)
  const warmText = uniqueText('credits-smoke-cache-hit')
  const before1 = await getEvents(args)

  const firstCall = await callJson({
    baseUrl: args.baseUrl,
    path: args.endpoint,
    method: 'POST',
    cookie: args.cookie,
    body: { text: warmText }
  })

  if (!firstCall.ok) {
    throw new Error(`Warm-up call failed: status=${firstCall.status} body=${JSON.stringify(firstCall.data)}`)
  }

  const afterFirst = await getEvents(args)

  const secondCall = await callJson({
    baseUrl: args.baseUrl,
    path: args.endpoint,
    method: 'POST',
    cookie: args.cookie,
    body: { text: warmText }
  })

  if (!secondCall.ok) {
    throw new Error(`Second cache call failed: status=${secondCall.status} body=${JSON.stringify(secondCall.data)}`)
  }

  const afterSecond = await getEvents(args)

  const firstDebits = debitCount(afterFirst, args.feature) - debitCount(before1, args.feature)
  const secondDebits = debitCount(afterSecond, args.feature) - debitCount(afterFirst, args.feature)

  console.log('[smoke] cache-hit check', JSON.stringify({
    first_source: firstCall.data?.source || null,
    second_source: secondCall.data?.source || null,
    first_call_debits_delta: firstDebits,
    second_call_debits_delta: secondDebits
  }))

  if (secondDebits !== 0) {
    throw new Error(`Expected no extra charge on second (cache) call, got delta=${secondDebits}`)
  }

  // Check 2: cache miss should charge once
  const missText = uniqueText('credits-smoke-cache-miss')
  const before2 = await getEvents(args)

  const missCall = await callJson({
    baseUrl: args.baseUrl,
    path: args.endpoint,
    method: 'POST',
    cookie: args.cookie,
    body: { text: missText }
  })

  if (!missCall.ok) {
    throw new Error(`Cache miss call failed: status=${missCall.status} body=${JSON.stringify(missCall.data)}`)
  }

  const after2 = await getEvents(args)
  const missDebits = debitCount(after2, args.feature) - debitCount(before2, args.feature)

  console.log('[smoke] cache-miss check', JSON.stringify({
    source: missCall.data?.source || null,
    debits_delta: missDebits
  }))

  if (missDebits !== 1) {
    throw new Error(`Expected exactly one debit on cache miss, got delta=${missDebits}`)
  }

  // Check 3: forced failure should refund
  const failText = uniqueText('credits-smoke-forced-fail')
  const before3 = await getEvents(args)

  const failCall = await callJson({
    baseUrl: args.baseUrl,
    path: args.endpoint,
    method: 'POST',
    cookie: args.cookie,
    body: { text: failText },
    extraHeaders: { 'x-credits-smoke-fail': '1' }
  })

  if (failCall.ok) {
    throw new Error('Expected forced failure call to fail, but it succeeded')
  }

  const after3 = await getEvents(args)
  const failDebits = debitCount(after3, args.feature) - debitCount(before3, args.feature)
  const failRefunds = refundCount(after3, args.feature) - refundCount(before3, args.feature)

  console.log('[smoke] forced-failure check', JSON.stringify({
    status: failCall.status,
    debits_delta: failDebits,
    refunds_delta: failRefunds
  }))

  if (failDebits !== 1 || failRefunds !== 1) {
    throw new Error(
      `Expected forced failure to create 1 debit + 1 refund, got debits=${failDebits} refunds=${failRefunds}`
    )
  }

  console.log('[smoke] PASS all credit checks')
}

run().catch((error) => {
  console.error('[smoke] FAIL', error.message)
  process.exit(1)
})
