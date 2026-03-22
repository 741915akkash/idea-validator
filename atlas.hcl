env "supabase" {
  url = getenv("SUPABASE_DB_URL")

  schema {
    src = "file://schema.hcl"
  }

  exclude = [
    "auth",
    "storage",
    "realtime",
    "graphql",
    "graphql_public",
    "extensions",
    "pgbouncer",
    "vault",
    "supabase_migrations"
  ]
}