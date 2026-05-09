-- =========================================================
-- CRM CONFIG TABLES -> USER SCOPED ONLY
-- Remove quiz scoping from reusable CRM configuration
-- =========================================================

BEGIN;

-- =========================================================
-- 1. DROP QUIZ FK CONSTRAINTS
-- =========================================================

ALTER TABLE public.pipeline_stages
DROP CONSTRAINT IF EXISTS pipeline_stages_quiz_id_fkey;

ALTER TABLE public.sources
DROP CONSTRAINT IF EXISTS sources_quiz_id_fkey;

ALTER TABLE public.sequences
DROP CONSTRAINT IF EXISTS sequences_quiz_id_fkey;

ALTER TABLE public.sequence_steps
DROP CONSTRAINT IF EXISTS sequence_steps_quiz_id_fkey;

-- =========================================================
-- 2. DROP QUIZ INDEXES
-- =========================================================

DROP INDEX IF EXISTS idx_pipeline_stages_quiz_id;

DROP INDEX IF EXISTS idx_sources_quiz_id;

DROP INDEX IF EXISTS idx_sequences_quiz_id;

DROP INDEX IF EXISTS idx_sequence_steps_quiz_id;

-- =========================================================
-- 3. DROP QUIZ_ID COLUMNS
-- =========================================================

ALTER TABLE public.pipeline_stages
DROP COLUMN IF EXISTS quiz_id;

ALTER TABLE public.sources
DROP COLUMN IF EXISTS quiz_id;

ALTER TABLE public.sequences
DROP COLUMN IF EXISTS quiz_id;

ALTER TABLE public.sequence_steps
DROP COLUMN IF EXISTS quiz_id;

-- =========================================================
-- 4. ENSURE USER-SCOPED INDEXES EXIST
-- (safe/idempotent)
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_user_id
ON public.pipeline_stages(user_id);

CREATE INDEX IF NOT EXISTS idx_sources_user_id
ON public.sources(user_id);

CREATE INDEX IF NOT EXISTS idx_sequences_user_id
ON public.sequences(user_id);

CREATE INDEX IF NOT EXISTS idx_sequence_steps_sequence_id
ON public.sequence_steps(sequence_id);

-- =========================================================
-- 5. COMMENTS FOR FUTURE MAINTAINERS
-- =========================================================

COMMENT ON TABLE public.pipeline_stages IS
'User-global reusable CRM pipeline stages shared across all quizzes';

COMMENT ON TABLE public.sources IS
'User-global reusable lead sources shared across all quizzes';

COMMENT ON TABLE public.sequences IS
'User-global reusable CRM sequences shared across all quizzes';

COMMENT ON TABLE public.sequence_steps IS
'Steps belonging to reusable user-global sequences';

COMMIT;