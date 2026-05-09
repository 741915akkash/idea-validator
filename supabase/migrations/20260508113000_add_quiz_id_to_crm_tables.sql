ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS quiz_id uuid;

ALTER TABLE public.pipeline_stages
ADD COLUMN IF NOT EXISTS quiz_id uuid;

ALTER TABLE public.sources
ADD COLUMN IF NOT EXISTS quiz_id uuid;

ALTER TABLE public.sequences
ADD COLUMN IF NOT EXISTS quiz_id uuid;

ALTER TABLE public.sequence_steps
ADD COLUMN IF NOT EXISTS quiz_id uuid;

ALTER TABLE public.lead_activities
ADD COLUMN IF NOT EXISTS quiz_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leads_quiz_id_fkey'
      AND conrelid = 'public.leads'::regclass
  ) THEN
    ALTER TABLE public.leads
    ADD CONSTRAINT leads_quiz_id_fkey
      FOREIGN KEY (quiz_id)
      REFERENCES public.quizzes(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pipeline_stages_quiz_id_fkey'
      AND conrelid = 'public.pipeline_stages'::regclass
  ) THEN
    ALTER TABLE public.pipeline_stages
    ADD CONSTRAINT pipeline_stages_quiz_id_fkey
      FOREIGN KEY (quiz_id)
      REFERENCES public.quizzes(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sources_quiz_id_fkey'
      AND conrelid = 'public.sources'::regclass
  ) THEN
    ALTER TABLE public.sources
    ADD CONSTRAINT sources_quiz_id_fkey
      FOREIGN KEY (quiz_id)
      REFERENCES public.quizzes(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sequences_quiz_id_fkey'
      AND conrelid = 'public.sequences'::regclass
  ) THEN
    ALTER TABLE public.sequences
    ADD CONSTRAINT sequences_quiz_id_fkey
      FOREIGN KEY (quiz_id)
      REFERENCES public.quizzes(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sequence_steps_quiz_id_fkey'
      AND conrelid = 'public.sequence_steps'::regclass
  ) THEN
    ALTER TABLE public.sequence_steps
    ADD CONSTRAINT sequence_steps_quiz_id_fkey
      FOREIGN KEY (quiz_id)
      REFERENCES public.quizzes(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lead_activities_quiz_id_fkey'
      AND conrelid = 'public.lead_activities'::regclass
  ) THEN
    ALTER TABLE public.lead_activities
    ADD CONSTRAINT lead_activities_quiz_id_fkey
      FOREIGN KEY (quiz_id)
      REFERENCES public.quizzes(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_quiz_id
  ON public.leads (quiz_id);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_quiz_id
  ON public.pipeline_stages (quiz_id);

CREATE INDEX IF NOT EXISTS idx_sources_quiz_id
  ON public.sources (quiz_id);

CREATE INDEX IF NOT EXISTS idx_sequences_quiz_id
  ON public.sequences (quiz_id);

CREATE INDEX IF NOT EXISTS idx_sequence_steps_quiz_id
  ON public.sequence_steps (quiz_id);

CREATE INDEX IF NOT EXISTS idx_lead_activities_quiz_id
  ON public.lead_activities (quiz_id);

-- Ensure every CRM user has at least one quiz row for deterministic backfill.
INSERT INTO public.quizzes (user_id, status, started_at, name, revision_number)
SELECT DISTINCT crm_users.user_id, 'IN_PROGRESS', now(), 'Auto-linked CRM idea', 0
FROM (
  SELECT user_id FROM public.leads
  UNION
  SELECT user_id FROM public.pipeline_stages
  UNION
  SELECT user_id FROM public.sources
  UNION
  SELECT user_id FROM public.sequences
) AS crm_users
LEFT JOIN public.quizzes q
  ON q.user_id = crm_users.user_id
WHERE crm_users.user_id IS NOT NULL
  AND q.id IS NULL;

-- Backfill leads from interview lineage first, fallback to latest quiz for owner.
WITH latest_quiz_per_user AS (
  SELECT DISTINCT ON (q.user_id)
    q.user_id,
    q.id AS quiz_id
  FROM public.quizzes q
  WHERE q.user_id IS NOT NULL
  ORDER BY q.user_id, q.started_at DESC NULLS LAST, q.id DESC
)
UPDATE public.leads l
SET quiz_id = COALESCE(i.quiz_id, lu.quiz_id)
FROM latest_quiz_per_user lu
LEFT JOIN public.interviews i
  ON i.id = l.interview_id
WHERE l.user_id = lu.user_id
  AND l.quiz_id IS NULL;

-- Backfill user-owned CRM config tables from latest quiz per user.
WITH latest_quiz_per_user AS (
  SELECT DISTINCT ON (q.user_id)
    q.user_id,
    q.id AS quiz_id
  FROM public.quizzes q
  WHERE q.user_id IS NOT NULL
  ORDER BY q.user_id, q.started_at DESC NULLS LAST, q.id DESC
)
UPDATE public.pipeline_stages ps
SET quiz_id = lu.quiz_id
FROM latest_quiz_per_user lu
WHERE ps.user_id = lu.user_id
  AND ps.quiz_id IS NULL;

WITH latest_quiz_per_user AS (
  SELECT DISTINCT ON (q.user_id)
    q.user_id,
    q.id AS quiz_id
  FROM public.quizzes q
  WHERE q.user_id IS NOT NULL
  ORDER BY q.user_id, q.started_at DESC NULLS LAST, q.id DESC
)
UPDATE public.sources s
SET quiz_id = lu.quiz_id
FROM latest_quiz_per_user lu
WHERE s.user_id = lu.user_id
  AND s.quiz_id IS NULL;

WITH latest_quiz_per_user AS (
  SELECT DISTINCT ON (q.user_id)
    q.user_id,
    q.id AS quiz_id
  FROM public.quizzes q
  WHERE q.user_id IS NOT NULL
  ORDER BY q.user_id, q.started_at DESC NULLS LAST, q.id DESC
)
UPDATE public.sequences s
SET quiz_id = lu.quiz_id
FROM latest_quiz_per_user lu
WHERE s.user_id = lu.user_id
  AND s.quiz_id IS NULL;

-- Backfill sequence_steps from parent sequence.
UPDATE public.sequence_steps ss
SET quiz_id = s.quiz_id
FROM public.sequences s
WHERE ss.sequence_id = s.id
  AND ss.quiz_id IS NULL;

-- Backfill lead_activities from interview lineage, fallback to linked lead.
UPDATE public.lead_activities la
SET quiz_id = COALESCE(i.quiz_id, l.quiz_id)
FROM public.leads l
LEFT JOIN public.interviews i
  ON i.id = la.interview_id
WHERE la.lead_id = l.id
  AND la.quiz_id IS NULL;

-- Enforce NOT NULL after backfill.
ALTER TABLE public.leads
ALTER COLUMN quiz_id SET NOT NULL;

ALTER TABLE public.pipeline_stages
ALTER COLUMN quiz_id SET NOT NULL;

ALTER TABLE public.sources
ALTER COLUMN quiz_id SET NOT NULL;

ALTER TABLE public.sequences
ALTER COLUMN quiz_id SET NOT NULL;

ALTER TABLE public.sequence_steps
ALTER COLUMN quiz_id SET NOT NULL;

ALTER TABLE public.lead_activities
ALTER COLUMN quiz_id SET NOT NULL;
