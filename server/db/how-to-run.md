                🧪 LOCAL DEVELOPMENT
        ─────────────────────────────────

   ┌───────────────────────────────┐
   │ Supabase Local DB (Docker)    │
   │                               │
   │ - Use Studio                  │
   │ - Run SQL manually            │
   │ - App writes schema changes   │
   └───────────────┬───────────────┘
                   │
                   ▼
        (you experiment freely)


        ┌──────────────────────────┐
        │ Feature complete?        │
        └──────────┬───────────────┘
                   │ YES
                   ▼


        🧾 CREATE MIGRATION FROM DIFF
        ─────────────────────────────

   supabase db diff -f add_feature_xyz

                   │
                   ▼

   ┌───────────────────────────────┐
   │ Generated migration file      │
   │ supabase/migrations/*.sql     │
   │                               │
   │ ⚠️ REVIEW THIS FILE           │
   │ - remove junk                 │
   │ - verify constraints          │
   └───────────────┬───────────────┘
                   │
                   ▼


        🔁 VALIDATE LOCALLY (CRITICAL)
        ─────────────────────────────

   supabase db reset

   (this does:)
   ❗ drops local DB
   ❗ replays ALL migrations from scratch

                   │
                   ▼

   ┌───────────────────────────────┐
   │ Local DB rebuilt from         │
   │ migrations only               │
   │                               │
   │ ✅ proves migrations are valid │
   └───────────────┬───────────────┘
                   │
                   ▼


        ☁️ DEPLOY TO REMOTE
        ─────────────────────────────

   npx supabase db push

                   │
                   ▼

   ┌───────────────────────────────┐
   │ Remote Supabase DB            │
   │                               │
   │ Applies ONLY new migrations   │
   │ in order                      │
   └───────────────────────────────┘