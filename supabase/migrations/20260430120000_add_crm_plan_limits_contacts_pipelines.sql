INSERT INTO public.plan_limits (plan_tier, feature, enabled, limit_value, period)
VALUES
  ('free', 'contacts', true, 100, 'lifetime'),
  ('growth', 'contacts', true, 5000, 'lifetime'),
  ('founder', 'contacts', true, 25000, 'lifetime'),
  ('free', 'pipelines', true, 1, 'lifetime'),
  ('growth', 'pipelines', true, NULL, 'lifetime'),
  ('founder', 'pipelines', true, NULL, 'lifetime')
ON CONFLICT (plan_tier, feature) DO UPDATE
SET
  enabled = EXCLUDED.enabled,
  limit_value = EXCLUDED.limit_value,
  period = EXCLUDED.period,
  updated_at = now();
