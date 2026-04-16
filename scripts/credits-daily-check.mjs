#!/usr/bin/env node

// Step 3 done.

// Implemented:
// - Daily sanity script: [credits-daily-check.mjs](/home/akash/projects/idea-validator/scripts/credits-daily-check.mjs)
//   - reports debit/refund/net by user
//   - reports daily debit/refund/net by user
//   - supports `--days`, `--limit-users`, `--feature`
// - NPM command:
//   - `npm run credits:daily-check` in [package.json](/home/akash/projects/idea-validator/package.json)
// - Usage note added:
//   - [README.md](/home/akash/projects/idea-validator/README.md)

// Run example:
// - `npm run credits:daily-check -- --days 7 --limit-users 50`
// - `npm run credits:daily-check -- --feature structured_validation_run`

// Proceed to Step 4 (rate-limit/admin-secret hardening for internal credits endpoint)?





import 'dotenv/config'
import { Client } from 'pg'

function parseArgs(argv) {
  const args = {
    days: Number(process.env.CREDITS_CHECK_DAYS || 7),
    limitUsers: Number(process.env.CREDITS_CHECK_USER_LIMIT || 50),
    feature: process.env.CREDITS_CHECK_FEATURE || null
  }

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i]
    const value = argv[i + 1]
    if (!key?.startsWith('--')) continue
    if (value == null || value.startsWith('--')) continue

    if (key === '--days') args.days = Number(value)
    if (key === '--limit-users') args.limitUsers = Number(value)
    if (key === '--feature') args.feature = String(value)
  }

  if (!Number.isInteger(args.days) || args.days <= 0) {
    throw new Error('days must be a positive integer')
  }

  if (!Number.isInteger(args.limitUsers) || args.limitUsers <= 0) {
    throw new Error('limit-users must be a positive integer')
  }

  return args
}

function asInt(value) {
  return Number.parseInt(String(value || '0'), 10)
}

async function run() {
  const args = parseArgs(process.argv)

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required')
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    const params = [args.days]
    const featureFilter = args.feature ? `AND ce.feature = $${params.push(args.feature)}` : ''

    const summarySql = `
      SELECT
        ce.user_id,
        COALESCE(u.email, '(unknown)') AS user_email,
        COUNT(*) FILTER (WHERE ce.amount < 0)::int AS debit_events,
        COALESCE(SUM(CASE WHEN ce.amount < 0 THEN -ce.amount ELSE 0 END), 0)::int AS debits,
        COUNT(*) FILTER (WHERE ce.amount > 0)::int AS refund_events,
        COALESCE(SUM(CASE WHEN ce.amount > 0 THEN ce.amount ELSE 0 END), 0)::int AS refunds,
        (COALESCE(SUM(CASE WHEN ce.amount > 0 THEN ce.amount ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN ce.amount < 0 THEN -ce.amount ELSE 0 END), 0))::int AS net
      FROM credit_events ce
      LEFT JOIN users u ON u.id = ce.user_id
      WHERE ce.created_at >= now() - ($1::int || ' days')::interval
      ${featureFilter}
      GROUP BY ce.user_id, u.email
      ORDER BY debits DESC, refunds DESC, ce.user_id ASC
      LIMIT ${args.limitUsers}
    `

    const dailySql = `
      SELECT
        date_trunc('day', ce.created_at AT TIME ZONE 'UTC')::date AS day,
        ce.user_id,
        COALESCE(u.email, '(unknown)') AS user_email,
        COALESCE(SUM(CASE WHEN ce.amount < 0 THEN -ce.amount ELSE 0 END), 0)::int AS debits,
        COALESCE(SUM(CASE WHEN ce.amount > 0 THEN ce.amount ELSE 0 END), 0)::int AS refunds,
        (COALESCE(SUM(CASE WHEN ce.amount > 0 THEN ce.amount ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN ce.amount < 0 THEN -ce.amount ELSE 0 END), 0))::int AS net
      FROM credit_events ce
      LEFT JOIN users u ON u.id = ce.user_id
      WHERE ce.created_at >= now() - ($1::int || ' days')::interval
      ${featureFilter}
      GROUP BY day, ce.user_id, u.email
      ORDER BY day DESC, debits DESC, refunds DESC, ce.user_id ASC
      LIMIT ${args.limitUsers * args.days}
    `

    const [summaryRes, dailyRes] = await Promise.all([
      client.query(summarySql, params),
      client.query(dailySql, params)
    ])

    const totals = summaryRes.rows.reduce(
      (acc, row) => {
        acc.debit_events += asInt(row.debit_events)
        acc.debits += asInt(row.debits)
        acc.refund_events += asInt(row.refund_events)
        acc.refunds += asInt(row.refunds)
        acc.net += asInt(row.net)
        return acc
      },
      { debit_events: 0, debits: 0, refund_events: 0, refunds: 0, net: 0 }
    )

    console.log('[credits-check] window', JSON.stringify({
      days: args.days,
      feature: args.feature || 'ALL',
      users_returned: summaryRes.rows.length,
      daily_rows: dailyRes.rows.length
    }))

    console.log('[credits-check] totals', JSON.stringify(totals))

    console.log('\n[credits-check] by user')
    console.table(summaryRes.rows)

    console.log('\n[credits-check] by day and user')
    console.table(dailyRes.rows)
  } finally {
    await client.end()
  }
}

run().catch((error) => {
  console.error('[credits-check] FAIL', error.message)
  process.exit(1)
})
