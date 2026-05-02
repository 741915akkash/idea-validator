INSERT INTO public.plan_limits (plan_tier, feature, enabled, limit_value, period)
VALUES
  ('free', 'contacts', true, 500, 'lifetime'),
  ('growth', 'contacts', true, 10000, 'lifetime')
ON CONFLICT (plan_tier, feature) DO UPDATE
SET
  enabled = EXCLUDED.enabled,
  limit_value = EXCLUDED.limit_value,
  period = EXCLUDED.period,
  updated_at = now();
