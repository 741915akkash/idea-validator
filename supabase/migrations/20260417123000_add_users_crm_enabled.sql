ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS crm_enabled boolean NOT NULL DEFAULT false;
