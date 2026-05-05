ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS interview_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leads_interview_id_fkey'
      AND conrelid = 'public.leads'::regclass
  ) THEN
    ALTER TABLE public.leads
    ADD CONSTRAINT leads_interview_id_fkey
      FOREIGN KEY (interview_id)
      REFERENCES public.interviews(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS unique_leads_interview_id
  ON public.leads (interview_id)
  WHERE interview_id IS NOT NULL;
