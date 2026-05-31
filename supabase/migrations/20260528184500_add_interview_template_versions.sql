ALTER TABLE interview_templates
ADD COLUMN IF NOT EXISTS version int4 NOT NULL DEFAULT 1;

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS template_version int4;