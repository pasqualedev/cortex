# Dev Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bare `tsx watch` dev script with one that starts Postgres via Docker Compose, waits for it to be healthy, runs Prisma migrations, then starts the server.

**Architecture:** A shell script (`cortex-api/scripts/dev.sh`) orchestrates the startup sequence. `package.json` `dev` entry delegates to this script. No new dependencies are required.

**Tech Stack:** Bash, Docker Compose, Prisma, tsx

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `cortex-api/scripts/dev.sh` | Full startup sequence with DB health wait |
| Modify | `cortex-api/package.json` | Point `dev` to the script; add `db:down` |

---

### Task 1: Create `cortex-api/scripts/dev.sh`

**Files:**
- Create: `cortex-api/scripts/dev.sh`

- [ ] **Step 1: Write the script**

Create `cortex-api/scripts/dev.sh` with this exact content:

```bash
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
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x cortex-api/scripts/dev.sh
```

- [ ] **Step 3: Verify the script syntax**

```bash
bash -n cortex-api/scripts/dev.sh
```

Expected: no output, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add cortex-api/scripts/dev.sh
git commit -m "feat: add dev.sh startup script with DB health wait and migrations"
```

---

### Task 2: Update `cortex-api/package.json`

**Files:**
- Modify: `cortex-api/package.json` (lines 7 and 17)

- [ ] **Step 1: Update the `dev` script and add `db:down`**

In `cortex-api/package.json`, change the `scripts` block from:

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "db:migrate": "prisma migrate dev",
  "db:seed": "tsx prisma/seed.ts",
  "db:studio": "prisma studio",
  "import:enem": "tsx scripts/import-enem.ts"
},
```

to:

```json
"scripts": {
  "dev": "bash scripts/dev.sh",
  "build": "tsc",
  "start": "node dist/server.js",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "db:migrate": "prisma migrate deploy",
  "db:down": "docker compose down",
  "db:seed": "tsx prisma/seed.ts",
  "db:studio": "prisma studio",
  "import:enem": "tsx scripts/import-enem.ts"
},
```

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "require('./cortex-api/package.json')" && echo "valid"
```

Expected: `valid`

- [ ] **Step 3: Smoke test the startup sequence**

From the `cortex-api/` directory:

```bash
cd cortex-api && npm run dev
```

Expected console output (in order):
```
[dev] Starting database...
[dev] Waiting for database to be healthy...
[dev] Running migrations...
[dev] Starting server...
```

Server should be accepting requests. Press Ctrl+C — both the tsx process and the container remain up (Docker is detached by design).

- [ ] **Step 4: Verify `db:down` stops the container**

```bash
npm run db:down
```

Expected: Postgres container stops and is removed.

- [ ] **Step 5: Commit**

```bash
git add cortex-api/package.json
git commit -m "feat: wire dev script to dev.sh and update db:migrate to deploy"
```
