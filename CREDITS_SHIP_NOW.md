# Credits Ship-Now Implementation

This file documents the fast-ship billing features implemented in this repo.

## What Was Implemented

### 1) Billing Toggle Guard (`CREDITS_ENABLED`)

Implemented in:
- `server/services/llm/structuredValidation.js`

Behavior:
- If `CREDITS_ENABLED` is set, it controls billing.
  - Truthy values: `1`, `true`, `yes`, `on`
- If `CREDITS_ENABLED` is not set, billing defaults to:
  - `enabled` in `production`
  - `disabled` otherwise
- When disabled, credit charging is skipped and a structured log is emitted:
  - `[credits][disabled_skip]`

---

### 2) Smoke Checks (Manual Script)

Implemented in:
- `scripts/credits-smoke.mjs`
- `package.json` script: `credits:smoke`

Checks covered:
- Cache hit -> no extra charge on second identical request
- Cache miss -> exactly one charge
- Forced failure -> charge + auto-refund

Forced failure hook (non-production only):
- Header: `x-credits-smoke-fail: 1`
- Implemented in `executeWithStructuredValidationCharge(...)`

Run:
```bash
CREDITS_ENABLED=true npm run credits:smoke -- --cookie "session_id=YOUR_SESSION_ID"
```

Optional args:
- `--base-url`
- `--endpoint`
- `--events-endpoint`
- `--feature`

---

### 3) Daily Billing Sanity Check Script

Implemented in:
- `scripts/credits-daily-check.mjs`
- `package.json` script: `credits:daily-check`
- README usage section updated

Outputs:
- Totals across time window: debit/refund events and amounts
- By-user summary: debits/refunds/net
- By-day-and-user summary: debits/refunds/net

Run:
```bash
npm run credits:daily-check -- --days 7 --limit-users 50
```

Optional feature filter:
```bash
npm run credits:daily-check -- --feature structured_validation_run
```

---

## Reusable Charge + Refund Helper

Implemented in:
- `server/services/llm/structuredValidation.js`

Helper:
- `executeWithStructuredValidationCharge(...)`

What it does:
- Charges credits (idempotent)
- Executes the LLM callback
- Auto-refunds if callback fails after charge

---

## Structured Billing Logs

Implemented in:
- `server/services/credits.js`

Log events:
- Spend: `spend_applied`, `spend_duplicate`, `spend_insufficient`, `spend_error`
- Refund: `refund_applied`, `refund_duplicate`, `refund_error`

Format:
- Prefix: `[credits][<event>]`
- Payload: JSON string

---

## Admin/Event Visibility

Implemented in:
- User-facing: `/api/credits/events`
- Internal admin: `/api/internal/credits/events`

Internal auth:
- `CREDITS_ADMIN_SECRET` via
  - `x-admin-secret` header, or
  - `Authorization: Bearer <secret>`

---

## Notes

- This is a pragmatic early-user setup optimized for shipping speed.
- Hardening (full test suite, reconciliation worker, alerting, stricter admin controls) is intentionally deferred.

## Features To Implement Later (Hardening)

1. Automated tests
- Concurrency race tests for `spendCredits`
- Idempotency retry tests
- Refund path tests
- Monthly reset behavior tests

2. Reconciliation worker
- Detect charge/refund mismatches
- Flag anomalies (e.g., repeated failures, refund spikes)
- Generate periodic reconciliation reports

3. Observability upgrades
- Metrics counters (charge success/fail, refunds, duplicates)
- Error-rate and anomaly alerts
- Dashboard for credits health

4. Refund policy matrix
- Define refund behavior by failure class
- Distinguish user errors vs transient infra errors
- Add reason codes taxonomy in ledger metadata

5. Security hardening
- Rate limiting for internal admin credits endpoints
- Access audit logs for admin credit reads
- IP allowlist / stronger auth controls for internal routes

6. Operational tooling
- Admin UI/report for credit ledger exploration
- Per-user credit timeline + filters
- One-click investigation workflow for disputed charges

7. Data lifecycle and compliance
- Retention policy for credit logs
- PII review and minimization in descriptions/metadata
- Backup/restore validation for billing-critical tables
