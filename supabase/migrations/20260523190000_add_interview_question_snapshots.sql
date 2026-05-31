-- =========================================================
-- INTERVIEW QUESTION SNAPSHOTS
-- =========================================================

CREATE TABLE IF NOT EXISTS interview_question_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    interview_id uuid NOT NULL
        REFERENCES interviews(id)
        ON DELETE CASCADE,

    original_question_id uuid
        REFERENCES interview_questions(id)
        ON DELETE SET NULL,

    text text NOT NULL,

    question_type text NOT NULL DEFAULT 'open_text',

    options_json jsonb,

    order_index int4 DEFAULT 0,

    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iqs_interview_id
ON interview_question_snapshots(interview_id);

CREATE INDEX IF NOT EXISTS idx_iqs_original_question_id
ON interview_question_snapshots(original_question_id);

-- =========================================================
-- INTERVIEW ANSWERS MIGRATION
-- =========================================================

ALTER TABLE interview_answers
ADD COLUMN IF NOT EXISTS snapshot_question_id uuid
REFERENCES interview_question_snapshots(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_interview_answers_snapshot_question_id
ON interview_answers(snapshot_question_id);

-- =========================================================
-- OPTIONAL: KEEP OLD question_id TEMPORARILY
-- =========================================================
-- DO NOT DROP question_id YET.
-- Keep backward compatibility until runtime migration done.

-- Later migration:
--
-- ALTER TABLE interview_answers
-- DROP COLUMN question_id;

-- =========================================================
-- EVIDENCE ENTRIES QUESTION MAPPING
-- =========================================================

ALTER TABLE evidence_entries
ADD COLUMN IF NOT EXISTS snapshot_question_id uuid
REFERENCES interview_question_snapshots(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_evidence_entries_snapshot_question_id
ON evidence_entries(snapshot_question_id);