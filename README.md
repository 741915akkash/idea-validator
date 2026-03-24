docker exec -it idea_validator_db psql -U postgres -d idea_validator

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

login to postgres container IN development

## OTP Email Setup (Signup + Login)

OTP for both signup and login is sent by `POST /api/auth/request-otp`.
If email provider env vars are missing, it falls back to console logging.

Use one of these provider setups:

### Option 1: Resend (recommended)

Add these in `.env`:

```bash
OTP_EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

`RESEND_FROM_EMAIL` must be a verified sender/domain in Resend.

### Option 2: AWS SES

Add these in `.env`:

```bash
OTP_EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@yourdomain.com
```

`SES_FROM_EMAIL` must be verified in SES.

### Restart and verify

1. Restart server: `npm run dev`
2. Request OTP from signup/login page
3. Check server logs:
   - You should **not** see: `provider=console`
   - If sending fails, API now returns `500 Unable to send verification code email...`
