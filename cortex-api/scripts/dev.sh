#!/usr/bin/env bash
set -euo pipefail

# Resolve to cortex-api/ regardless of where npm run dev is called from
cd "$(dirname "$0")/.."

echo "[dev] Starting database..."
docker compose up -d

echo "[dev] Waiting for database to be healthy..."
TIMEOUT=60
ELAPSED=0
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "[dev] ERROR: Database did not become healthy within ${TIMEOUT}s. Aborting."
    exit 1
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

echo "[dev] Running migrations..."
npx prisma migrate deploy

echo "[dev] Starting server..."
exec npx tsx watch src/server.ts
