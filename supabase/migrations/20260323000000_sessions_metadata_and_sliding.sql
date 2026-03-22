ALTER TABLE "public"."sessions"
  ADD COLUMN IF NOT EXISTS "ip" text NULL,
  ADD COLUMN IF NOT EXISTS "user_agent" text NULL;

CREATE INDEX IF NOT EXISTS "idx_sessions_user_created_desc"
  ON "public"."sessions" ("user_id", "created_at" DESC);
