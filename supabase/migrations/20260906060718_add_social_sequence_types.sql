-- Expand allowed sequence step types
ALTER TABLE public.sequence_steps
DROP CONSTRAINT IF EXISTS sequence_steps_type_check;

ALTER TABLE public.sequence_steps
ADD CONSTRAINT sequence_steps_type_check
  CHECK (type IN ('call', 'email', 'x', 'linkedin', 'note'));


-- Expand allowed lead activity types
ALTER TABLE public.lead_activities
DROP CONSTRAINT IF EXISTS lead_activities_type_check;

ALTER TABLE public.lead_activities
ADD CONSTRAINT lead_activities_type_check
  CHECK (type IN ('note', 'email', 'call', 'x', 'linkedin'));