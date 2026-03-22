#!/bin/bash

set -e

# 🎨 Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[1;34m"
NC="\033[0m" # reset

# Load env
set -a
source .env
set +a

echo "DATABASE_URL=$DATABASE_URL"
echo "SUPABASE_DB_URL=$SUPABASE_DB_URL"
echo "ATLAS_DEV_URL=$ATLAS_DEV_URL"

# Validate env
if [ -z "$DATABASE_URL" ] || [ -z "$SUPABASE_DB_URL" ] || [ -z "$ATLAS_DEV_URL" ]; then
  echo -e "${RED}❌ Missing required env vars${NC}"
  exit 1
fi

mkdir -p migrations

TS=$(date +"%Y%m%d%H%M%S")

echo -e "${BLUE}🔍 Diffing LOCAL → SUPABASE...${NC}"

RAW=$(atlas schema diff \
  --from "$SUPABASE_DB_URL" \
  --to "$DATABASE_URL" \
  --dev-url "$ATLAS_DEV_URL" \
  --exclude "schema:auth" \
  --exclude "schema:storage" \
  --exclude "schema:extensions" \
  --exclude "schema:realtime" \
  --exclude "schema:graphql" \
  --exclude "schema:graphql_public" \
  --exclude "schema:pgbouncer" \
  --exclude "schema:vault"
)

# 🛑 HARD FILTER (extra safety)
RAW=$(echo "$RAW" | grep -vE 'DROP SCHEMA "auth"|DROP SCHEMA "storage"|DROP SCHEMA "extensions"|DROP SCHEMA "realtime"|DROP SCHEMA "graphql"|DROP SCHEMA "graphql_public"|DROP SCHEMA "pgbouncer"|DROP SCHEMA "vault"')

if [ -z "$RAW" ]; then
  echo -e "${GREEN}✅ No changes${NC}"
  exit 0
fi

# 🧹 Remove previous diff
find migrations -type f -name "*-diff.sql" -delete

DIFF_FILE="migrations/${TS}-diff.sql"
echo "$RAW" > "$DIFF_FILE"

echo -e "${BLUE}📝 Diff saved: $DIFF_FILE${NC}"

# -----------------------------
# 📦 GROUP BY TABLE
# -----------------------------
echo ""
echo -e "${BLUE}📊 Grouped Summary:${NC}"
echo "----------------------------------"

TABLES=$(echo "$RAW" | grep -oE 'TABLE [a-zA-Z0-9_]+' | awk '{print $2}' | sort -u)

for TABLE in $TABLES; do
  echo -e "\n${BLUE}📦 Table: $TABLE${NC}"

  CHANGES=$(echo "$RAW" | grep -E "$TABLE" || true)

  echo "$CHANGES" | while read -r line; do
    if [[ "$line" =~ DROP|TRUNCATE|DELETE ]]; then
      echo -e "${RED}  🔴 $line${NC}"
    elif [[ "$line" =~ ALTER ]]; then
      echo -e "${YELLOW}  🟡 $line${NC}"
    elif [[ "$line" =~ CREATE|ADD ]]; then
      echo -e "${GREEN}  🟢 $line${NC}"
    else
      echo "  $line"
    fi
  done
done

echo ""
echo "----------------------------------"

# -----------------------------
# ⚠️ SAFETY CHECK
# -----------------------------
DANGEROUS=$(echo "$RAW" | grep -E "DROP TABLE|DROP COLUMN|DROP INDEX|ALTER TYPE|TRUNCATE|DELETE FROM")

if [ ! -z "$DANGEROUS" ]; then
  echo ""
  echo -e "${RED}⚠️  Dangerous operations detected:${NC}"
  echo "----------------------------------"
  echo "$DANGEROUS"
  echo "----------------------------------"

  read -p "❗ Continue anyway? (y/n): " CONFIRM
  if [ "$CONFIRM" != "y" ]; then
    echo -e "${RED}❌ Aborted${NC}"
    exit 1
  fi
fi

# -----------------------------
# 🧠 GROUPED MIGRATION TEMPLATE (NO MUTATION)
# -----------------------------

SUGGESTED_FILE="migrations/${TS}-migration-template.sql"

{
  echo "-- ==========================================="
  echo "-- 🔥 Migration: ${TS}"
  echo "-- Generated from Atlas diff"
  echo "-- ⚠️  REVIEW BEFORE APPLYING"
  echo "-- ==========================================="
  echo ""

  CURRENT_TABLE=""

  echo "$RAW" | while IFS= read -r line; do

    # Detect table name
    if [[ "$line" =~ TABLE[[:space:]]+\"?([a-zA-Z0-9_]+)\"? ]]; then
      TABLE_NAME="${BASH_REMATCH[1]}"
      if [ "$TABLE_NAME" != "$CURRENT_TABLE" ]; then
        echo ""
        echo "-- ==========================================="
        echo "-- 📦 Table: $TABLE_NAME"
        echo "-- ==========================================="
        CURRENT_TABLE="$TABLE_NAME"
      fi
    fi

    # Classification
    if [[ "$line" =~ DROP|TRUNCATE|DELETE ]]; then
      echo "-- 🔴 DANGEROUS"
      echo "-- $line"

    elif [[ "$line" =~ ALTER ]]; then
      echo "-- 🟡 REVIEW"
      echo "$line"

    elif [[ "$line" =~ CREATE|ADD ]]; then
      echo "-- 🟢 SAFE"
      echo "$line"

    else
      echo "$line"
    fi

  done

} > "$SUGGESTED_FILE"

echo ""
echo -e "${GREEN}🧠 Grouped migration template: $SUGGESTED_FILE${NC}"
echo -e "${YELLOW}👉 Comments preserved, nothing mutated${NC}"