-- 1. Allow global sources (user_id can be NULL)
ALTER TABLE sources
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add system flag
ALTER TABLE sources
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- 3. Add uniqueness for global sources
CREATE UNIQUE INDEX IF NOT EXISTS unique_global_sources
ON sources (LOWER(name))
WHERE user_id IS NULL;

-- 4. Add uniqueness for user sources
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_sources
ON sources (user_id, LOWER(name))
WHERE user_id IS NOT NULL;

-- 5. Insert global default "interview"
INSERT INTO sources (name, user_id, is_system, created_at)
VALUES ('interview', NULL, true, NOW())
ON CONFLICT DO NOTHING;