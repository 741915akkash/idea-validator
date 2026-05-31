BEGIN;

ALTER TABLE interview_templates
ADD COLUMN IF NOT EXISTS tags jsonb;

COMMIT;