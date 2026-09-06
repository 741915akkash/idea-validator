ALTER TABLE public.sequences
ADD COLUMN IF NOT EXISTS business_days_only boolean NOT NULL DEFAULT false;