-- OTP auth core tables and indexes.

CREATE TABLE IF NOT EXISTS public.login_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT login_codes_attempts_non_negative CHECK (attempts >= 0)
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_codes_email_created_at
  ON public.login_codes (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON public.sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
  ON public.sessions (expires_at);

-- Enforce case-insensitive uniqueness because auth normalizes email.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique
  ON public.users ((lower(email)));
