BEGIN;

-- Remove old global-per-user constraints

ALTER TABLE public.pipeline_stages
DROP CONSTRAINT IF EXISTS unique_stage_position_per_user;

ALTER TABLE public.pipeline_stages
DROP CONSTRAINT IF EXISTS unique_stage_name_per_user;

-- Make pipeline_id required

ALTER TABLE public.pipeline_stages
ALTER COLUMN pipeline_id SET NOT NULL;

-- Add proper pipeline-scoped constraints

ALTER TABLE public.pipeline_stages
ADD CONSTRAINT unique_stage_position_per_pipeline
UNIQUE (pipeline_id, position);

ALTER TABLE public.pipeline_stages
ADD CONSTRAINT unique_stage_name_per_pipeline
UNIQUE (pipeline_id, name);

COMMIT;