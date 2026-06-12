# Dev Script Design

**Date:** 2026-06-12
**Scope:** `cortex-api` — automated `dev` startup sequence

## Goal

Replace the bare `tsx watch src/server.ts` dev script with one that starts the database, waits for it to be healthy, runs migrations, then starts the server — all with a single `npm run dev`.

## Architecture

A shell script (`cortex-api/scripts/dev.sh`) orchestrates three sequential steps. The `package.json` `dev` entry points to this script. No new runtime dependencies are added.

```
npm run dev
  └── bash scripts/dev.sh
        ├── docker compose up -d          (start postgres in background)
        ├── wait for healthy              (poll Docker healthcheck, 60s timeout)
        ├── npx prisma migrate deploy     (apply pending migrations, no prompt)
        └── exec tsx watch src/server.ts  (hand off process; Ctrl+C stops server)
```

## Components

**`cortex-api/scripts/dev.sh`**
- Runs `docker compose up -d` using the `cortex-api/docker-compose.yml` (postgres:15-alpine)
- Polls `docker inspect` every 2s until the container health status is `healthy`
- Exits with error if 60s elapses without becoming healthy
- Runs `npx prisma migrate deploy` after the DB is confirmed ready
- Uses `exec` to replace the shell process with `tsx watch src/server.ts` so Ctrl+C cleanly terminates the server

**`cortex-api/package.json` changes**
- `"dev"` updated to `"bash scripts/dev.sh"`
- `"db:down"` added as `"docker compose down"` for convenience

## Error Handling

- DB timeout: script exits with a non-zero code and prints a clear message, preventing migrate from running against an unavailable DB
- Migration failure: `npx prisma migrate deploy` exits non-zero on failure; script inherits this and stops before starting the server

## Files Affected

- `cortex-api/scripts/dev.sh` *(new)*
- `cortex-api/package.json` *(update `dev` script, add `db:down`)*
