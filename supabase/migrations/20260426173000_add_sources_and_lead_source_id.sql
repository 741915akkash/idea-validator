CREATE TABLE IF NOT EXISTS public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT sources_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(id)
    ON DELETE CASCADE
);

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS source_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leads_source_id_fkey'
      AND conrelid = 'public.leads'::regclass
  ) THEN
    ALTER TABLE public.leads
    ADD CONSTRAINT leads_source_id_fkey
      FOREIGN KEY (source_id)
      REFERENCES public.sources(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sources_user_id
  ON public.sources (user_id);

CREATE INDEX IF NOT EXISTS idx_leads_source_id
  ON public.leads (source_id);

CREATE UNIQUE INDEX IF NOT EXISTS unique_sources_user_lower_name
  ON public.sources (user_id, lower(name));
