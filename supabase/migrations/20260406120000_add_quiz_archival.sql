ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS archived_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_quizzes_user_archived
ON public.quizzes (user_id, archived_at, started_at DESC);

