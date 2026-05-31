-- =========================================================
-- RESEARCH INTERVIEW SYSTEM MIGRATION
-- Safe additive migration
-- Does NOT break existing structured interviews
-- PostgreSQL / Supabase
-- =========================================================

BEGIN;
 
-- =========================================================
-- 1. INTERVIEW TEMPLATES
-- =========================================================

CREATE TABLE IF NOT EXISTS interview_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id uuid NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    title text NOT NULL,

    description text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_templates_user_id
ON interview_templates(user_id);

-- =========================================================
-- 2. ALTER interview_questions
-- =========================================================

-- allow research-template questions
ALTER TABLE interview_questions
ALTER COLUMN goal_id DROP NOT NULL;

-- reusable template support
ALTER TABLE interview_questions
ADD COLUMN IF NOT EXISTS template_id uuid
REFERENCES interview_templates(id)
ON DELETE CASCADE;

-- question rendering type
ALTER TABLE interview_questions
ADD COLUMN IF NOT EXISTS question_type text
DEFAULT 'open_text';

-- mcq/rating/etc config
ALTER TABLE interview_questions
ADD COLUMN IF NOT EXISTS options_json jsonb;

-- timestamps
ALTER TABLE interview_questions
ADD COLUMN IF NOT EXISTS updated_at timestamptz
DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_interview_questions_template_id
ON interview_questions(template_id);

-- =========================================================
-- 3. ALTER interviews
-- =========================================================

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS template_id uuid
REFERENCES interview_templates(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_interviews_template_id
ON interviews(template_id);

-- =========================================================
-- 4. INTERVIEW ANSWERS
-- =========================================================

CREATE TABLE IF NOT EXISTS interview_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    interview_id uuid NOT NULL
        REFERENCES interviews(id)
        ON DELETE CASCADE,

    question_id uuid NOT NULL
        REFERENCES interview_questions(id)
        ON DELETE CASCADE,

    -- open-ended answers
    answer_text text,

    -- mcq, ratings, multi-select, structured answers
    answer_json jsonb,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_answers_interview_id
ON interview_answers(interview_id);

CREATE INDEX IF NOT EXISTS idx_interview_answers_question_id
ON interview_answers(question_id);

-- one answer per question per interview
CREATE UNIQUE INDEX IF NOT EXISTS uq_interview_answers_interview_question
ON interview_answers(interview_id, question_id);

COMMIT;