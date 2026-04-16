ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_status text NULL,
ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz NULL;

-- Backfill is idempotent in case the column existed before this migration.
UPDATE public.users
SET plan_tier = 'free'
WHERE plan_tier IS NULL;
