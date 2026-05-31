-- =========================================================
-- UNIQUE SNAPSHOT ANSWER CONSTRAINT
-- =========================================================

CREATE UNIQUE INDEX IF NOT EXISTS
idx_interview_answers_unique_snapshot
ON interview_answers (
    interview_id,
    snapshot_question_id
);

-- =========================================================
-- OPTIONAL CLEANUP LATER
-- =========================================================
-- After full migration:
--
-- DROP old unique index:
-- (interview_id, question_id)
--
-- DROP COLUMN question_id
--
-- But NOT yet.