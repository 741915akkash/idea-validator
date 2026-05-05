ALTER TABLE public.lead_activities
ADD COLUMN IF NOT EXISTS interview_id uuid;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lead_activities_type_check'
      AND conrelid = 'public.lead_activities'::regclass
  ) THEN
    ALTER TABLE public.lead_activities
    DROP CONSTRAINT lead_activities_type_check;
  END IF;
END $$;

ALTER TABLE public.lead_activities
ADD CONSTRAINT lead_activities_type_check
CHECK (type IN ('note', 'email', 'call', 'interview'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lead_activities_interview_id_fkey'
      AND conrelid = 'public.lead_activities'::regclass
  ) THEN
    ALTER TABLE public.lead_activities
    ADD CONSTRAINT lead_activities_interview_id_fkey
      FOREIGN KEY (interview_id)
      REFERENCES public.interviews(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lead_activities_interview_id
  ON public.lead_activities (interview_id);
