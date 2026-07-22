#!/usr/bin/env bash
# Apply Cloud SQL migrations for RevHackers GCP
# Usage: PGPASSWORD=xxx ./api/db/apply-migrations.sh [host] [port]
set -euo pipefail

PSQL_HOST="${1:-34.39.242.211}"
PSQL_PORT="${2:-5432}"
PSQL_DB="revhackers"
PSQL_USER="${PSQL_USER:-postgres}"
MIGRATIONS_DIR="$(cd "$(dirname "$0")/migrations" && pwd)"

export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

echo "==> Connecting to Cloud SQL at ${PSQL_HOST}:${PSQL_PORT} as ${PSQL_USER}"

PSQL_OPTS="-h ${PSQL_HOST} -p ${PSQL_PORT} -U ${PSQL_USER} -d ${PSQL_DB} --single-transaction"

# Create migrations tracking table if not exists
psql $PSQL_OPTS -c "
CREATE TABLE IF NOT EXISTS app_schema.migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);" 2>/dev/null || \
psql $PSQL_OPTS -c "
CREATE SCHEMA IF NOT EXISTS app_schema;
CREATE TABLE IF NOT EXISTS app_schema.migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);"

echo "==> Applying migrations..."

for file in "$MIGRATIONS_DIR"/*.sql; do
  name="$(basename "$file")"
  applied=$(psql $PSQL_OPTS -tAc "SELECT COUNT(1) FROM app_schema.migrations WHERE name = '$name';")
  if [ "$applied" = "1" ]; then
    echo "  [SKIP] $name (already applied)"
  else
    echo "  [APPLY] $name"
    psql $PSQL_OPTS -f "$file"
    psql $PSQL_OPTS -c "INSERT INTO app_schema.migrations (name) VALUES ('$name') ON CONFLICT DO NOTHING;"
    echo "  [DONE] $name"
  fi
done

echo "==> All migrations complete."
