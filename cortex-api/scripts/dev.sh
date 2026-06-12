#!/usr/bin/env bash
set -euo pipefail

# Resolve to cortex-api/ regardless of where npm run dev is called from
cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "[dev] ERROR: Docker is not running. Start Docker Desktop and retry."
  exit 1
fi

echo "[dev] Starting database..."
DB_SERVICE="${DB_SERVICE:-postgres}"
docker compose up -d

echo "[dev] Waiting for database to be healthy..."
TIMEOUT=60
ELAPSED=0
until docker compose exec -T "$DB_SERVICE" pg_isready -U postgres > /dev/null 2>&1; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "[dev] ERROR: Database did not become healthy within ${TIMEOUT}s. Aborting."
    exit 1
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

echo "[dev] Running migrations..."
# deploy (not dev) — non-interactive, no shadow database required
npx prisma migrate deploy

echo "[dev] Starting server..."
exec npx tsx watch src/server.ts
