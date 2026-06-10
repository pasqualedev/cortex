# Cortex ENEM MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Cortex ENEM MVP — a gamified ENEM study platform with cognitive brain attributes, challenge sessions, XP/levels/streak, and skill tree.

**Architecture:** Next.js App Router full-stack. Route Handlers under `/app/api/v1/` serve as the REST API layer (Controller → Service → Repository → Prisma). TanStack Query handles all server-state on the client; Zustand holds ephemeral local state (active challenge session). Auth.js v5 protects all `(app)` routes via middleware.

**Tech Stack:** Next.js (latest), TypeScript, Tailwind CSS, shadcn/ui, Auth.js v5, Prisma ORM, PostgreSQL, TanStack Query v5, Zustand, Zod, Vitest, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-06-10-cortex-mvp-design.md`

---

## File Map

```
cortex/
├── middleware.ts
├── docker-compose.yml
├── vitest.config.ts
├── vitest.setup.ts
├── app/
│   ├── layout.tsx                              # root layout, TanStack QueryClientProvider
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                          # session guard → /login
│   │   ├── onboarding/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── desafio/page.tsx
│   │   └── skill-tree/page.tsx
│   └── api/v1/
│       ├── auth/[...nextauth]/route.ts
│       ├── users/me/route.ts
│       ├── users/me/onboarding/route.ts
│       ├── dashboard/route.ts
│       ├── challenges/next/route.ts
│       ├── answers/route.ts
│       └── skill-tree/route.ts
├── src/
│   ├── lib/
│   │   ├── prisma.ts                           # PrismaClient singleton
│   │   ├── auth.ts                             # Auth.js v5 config
│   │   └── query-client.ts                     # TanStack QueryClient factory
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── question.model.ts
│   │   ├── answer.model.ts
│   │   └── skill-progress.model.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── question.repository.ts
│   │   ├── answer.repository.ts
│   │   └── skill-progress.repository.ts
│   ├── services/
│   │   ├── dashboard.service.ts
│   │   ├── challenge.service.ts
│   │   ├── answer.service.ts
│   │   ├── skill-tree.service.ts
│   │   └── user.service.ts
│   ├── store/
│   │   └── challenge.store.ts
│   ├── hooks/
│   │   ├── use-dashboard.ts
│   │   ├── use-challenge.ts
│   │   └── use-skill-tree.ts
│   └── components/
│       ├── providers.tsx                        # QueryClientProvider wrapper
│       ├── brain-status/
│       │   └── brain-status.tsx
│       ├── skill-card/
│       │   └── skill-card.tsx
│       └── question-session/
│           ├── question-session.tsx
│           ├── question-card.tsx
│           └── xp-feedback.tsx
├── prisma/
│   └── schema.prisma
└── scripts/
    └── import-questions.ts
```

---

## Phase 1 — Project Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `app/layout.tsx`
- Create: `docker-compose.yml`

- [ ] **Step 1: Create Next.js project**

```bash
npx create-next-app@latest cortex \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
cd cortex
```

Expected: project scaffold created with App Router and `src/` directory.

- [ ] **Step 2: Install core dependencies**

```bash
npm install \
  @tanstack/react-query@^5 \
  zustand \
  zod \
  next-auth@beta \
  @auth/prisma-adapter \
  prisma \
  @prisma/client \
  bcryptjs

npm install -D \
  @types/bcryptjs \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/jest-dom \
  jsdom
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted: Style → Default, Base color → Zinc, CSS variables → Yes.

- [ ] **Step 4: Add required shadcn components**

```bash
npx shadcn@latest add button card progress badge input label separator
```

- [ ] **Step 5: Create `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: cortex
      POSTGRES_PASSWORD: cortex
      POSTGRES_DB: cortex
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

- [ ] **Step 6: Create `.env.local`**

```env
DATABASE_URL="postgresql://cortex:cortex@localhost:5432/cortex"
AUTH_SECRET="replace-with-a-random-32-char-string"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Generate `AUTH_SECRET` with: `openssl rand -base64 32`

- [ ] **Step 7: Start PostgreSQL**

```bash
docker compose up -d
```

Expected: container `cortex-postgres-1` running.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js project with core dependencies"
```

---

### Task 2: Prisma Schema + Migration

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Auth.js v5 required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  passwordHash  String?
  targetScore   Int?
  xp            Int       @default(0)
  level         Int       @default(1)
  streakDays    Int       @default(0)
  lastStudiedAt DateTime?
  createdAt     DateTime  @default(now())

  accounts      Account[]
  answers       Answer[]
  skillProgress SkillProgress[]
}

model Question {
  id           String   @id @default(cuid())
  externalId   String   @unique
  year         Int
  index        Int
  area         String
  topic        String
  subtopic     String
  statement    String
  alternatives Json
  correctKey   String
  difficulty   Int      @default(3)
  imageUrl     String?
  createdAt    DateTime @default(now())

  answers Answer[]
}

model Answer {
  id         String   @id @default(cuid())
  userId     String
  questionId String
  chosenKey  String
  isCorrect  Boolean
  xpEarned   Int
  answeredAt DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id])
  question Question @relation(fields: [questionId], references: [id])
}

model SkillProgress {
  id       String @id @default(cuid())
  userId   String
  area     String
  topic    String
  accuracy Float  @default(0)
  total    Int    @default(0)
  correct  Int    @default(0)

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, area, topic])
}
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: migration `prisma/migrations/..._init/migration.sql` created and applied.

- [ ] **Step 4: Create `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/prisma.ts
git commit -m "feat: add Prisma schema and database migration"
```

---

### Task 3: Vitest Setup

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```typescript
import "@testing-library/jest-dom"
```

- [ ] **Step 3: Add test script to `package.json`**

Open `package.json` and add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify Vitest works**

```bash
npm test
```

Expected: `No test files found` (no error).

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json
git commit -m "chore: configure Vitest for unit testing"
```

---

### Task 4: Auth.js v5 Setup

**Files:**
- Create: `src/lib/auth.ts`
- Create: `app/api/v1/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create `src/lib/auth.ts`**

```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google,
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
```

- [ ] **Step 2: Create `app/api/v1/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 3: Create `middleware.ts` at project root**

```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") ||
                      req.nextUrl.pathname.startsWith("/register")
  const isApiAuth = req.nextUrl.pathname.startsWith("/api/v1/auth")

  if (isApiAuth) return NextResponse.next()
  if (isAuthRoute) return NextResponse.next()
  if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.nextUrl))

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 4: Extend Next.js session types — create `src/types/next-auth.d.ts`**

```typescript
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"]
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts app/api/v1/auth middleware.ts src/types/
git commit -m "feat: configure Auth.js v5 with Google and Credentials providers"
```

---

## Phase 2 — Type Models

### Task 5: Domain Models

**Files:**
- Create: `src/models/user.model.ts`
- Create: `src/models/question.model.ts`
- Create: `src/models/answer.model.ts`
- Create: `src/models/skill-progress.model.ts`

- [ ] **Step 1: Create `src/models/user.model.ts`**

```typescript
export interface UserProfile {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly image: string | null
  readonly targetScore: number | null
  readonly xp: number
  readonly level: number
  readonly streakDays: number
  readonly lastStudiedAt: Date | null
}

export interface DashboardData {
  readonly user: UserProfile
  readonly energiaNeuralPct: number
  readonly memoriaLongoPrazoPct: number
  readonly skillSummary: readonly AreaSummary[]
}

export interface AreaSummary {
  readonly area: string
  readonly accuracy: number
  readonly total: number
}
```

- [ ] **Step 2: Create `src/models/question.model.ts`**

```typescript
export interface Alternative {
  readonly key: string
  readonly text: string
}

export interface Question {
  readonly id: string
  readonly externalId: string
  readonly year: number
  readonly index: number
  readonly area: string
  readonly topic: string
  readonly subtopic: string
  readonly statement: string
  readonly alternatives: readonly Alternative[]
  readonly correctKey: string
  readonly difficulty: number
  readonly imageUrl: string | null
}
```

- [ ] **Step 3: Create `src/models/answer.model.ts`**

```typescript
export interface SubmitAnswerInput {
  readonly questionId: string
  readonly chosenKey: string
}

export interface AnswerResult {
  readonly isCorrect: boolean
  readonly xpEarned: number
  readonly correctKey: string
  readonly newXp: number
  readonly newLevel: number
  readonly newStreakDays: number
}
```

- [ ] **Step 4: Create `src/models/skill-progress.model.ts`**

```typescript
export interface SkillProgressEntry {
  readonly area: string
  readonly topic: string
  readonly accuracy: number
  readonly total: number
  readonly correct: number
}

export interface SkillTreeData {
  readonly areas: readonly AreaProgress[]
}

export interface AreaProgress {
  readonly area: string
  readonly accuracy: number
  readonly total: number
  readonly topics: readonly SkillProgressEntry[]
}
```

- [ ] **Step 5: Commit**

```bash
git add src/models/
git commit -m "feat: add domain model interfaces"
```

---

## Phase 3 — Repositories

### Task 6: User Repository

**Files:**
- Create: `src/repositories/user.repository.ts`

- [ ] **Step 1: Create `src/repositories/user.repository.ts`**

```typescript
import { prisma } from "@/lib/prisma"
import type { UserProfile } from "@/models/user.model"

/** @returns UserProfile or null if not found */
export async function findUserById(id: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      targetScore: true,
      xp: true,
      level: true,
      streakDays: true,
      lastStudiedAt: true,
    },
  })
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      targetScore: true,
      xp: true,
      level: true,
      streakDays: true,
      lastStudiedAt: true,
    },
  })
}

export async function createUserWithPassword(data: {
  email: string
  name: string
  passwordHash: string
}): Promise<UserProfile> {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      targetScore: true,
      xp: true,
      level: true,
      streakDays: true,
      lastStudiedAt: true,
    },
  })
}

export async function updateUserOnboarding(
  userId: string,
  targetScore: number
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { targetScore },
  })
}

export async function updateUserProgress(
  userId: string,
  data: { xp: number; level: number; streakDays: number; lastStudiedAt: Date }
): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/repositories/user.repository.ts
git commit -m "feat: add user repository"
```

---

### Task 7: Question Repository

**Files:**
- Create: `src/repositories/question.repository.ts`

- [ ] **Step 1: Create `src/repositories/question.repository.ts`**

```typescript
import { prisma } from "@/lib/prisma"
import type { Question } from "@/models/question.model"

/** Returns questions for a challenge session, avoiding recently answered ones */
export async function findQuestionsForChallenge(params: {
  userId: string
  weakTopics: readonly string[]
  avoidQuestionIds: readonly string[]
  limit: number
}): Promise<Question[]> {
  const { userId, weakTopics, avoidQuestionIds, limit } = params

  const questions = await prisma.question.findMany({
    where: {
      id: { notIn: avoidQuestionIds as string[] },
    },
    orderBy: [
      { difficulty: "asc" },
    ],
    take: limit * 3,
  })

  // prioritize weak topics, then fill remaining slots
  const weak = questions.filter((q) => weakTopics.includes(q.topic))
  const others = questions.filter((q) => !weakTopics.includes(q.topic))
  const pool = [...weak, ...others].slice(0, limit)

  return pool.map((q) => ({
    ...q,
    alternatives: q.alternatives as Question["alternatives"],
  }))
}

export async function findRecentlyAnsweredQuestionIds(
  userId: string,
  daysSince: number
): Promise<string[]> {
  const since = new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000)
  const answers = await prisma.answer.findMany({
    where: { userId, answeredAt: { gte: since } },
    select: { questionId: true },
    distinct: ["questionId"],
  })
  return answers.map((a) => a.questionId)
}

export async function findQuestionById(id: string): Promise<Question | null> {
  const q = await prisma.question.findUnique({ where: { id } })
  if (!q) return null
  return { ...q, alternatives: q.alternatives as Question["alternatives"] }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/repositories/question.repository.ts
git commit -m "feat: add question repository"
```

---

### Task 8: Answer + SkillProgress Repositories

**Files:**
- Create: `src/repositories/answer.repository.ts`
- Create: `src/repositories/skill-progress.repository.ts`

- [ ] **Step 1: Create `src/repositories/answer.repository.ts`**

```typescript
import { prisma } from "@/lib/prisma"

export async function createAnswer(data: {
  userId: string
  questionId: string
  chosenKey: string
  isCorrect: boolean
  xpEarned: number
}): Promise<void> {
  await prisma.answer.create({ data })
}

export async function countRecentAnswers(
  userId: string,
  daysSince: number
): Promise<number> {
  const since = new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000)
  return prisma.answer.count({
    where: { userId, answeredAt: { gte: since } },
  })
}
```

- [ ] **Step 2: Create `src/repositories/skill-progress.repository.ts`**

```typescript
import { prisma } from "@/lib/prisma"
import type { SkillProgressEntry } from "@/models/skill-progress.model"

export async function findAllSkillProgress(
  userId: string
): Promise<SkillProgressEntry[]> {
  return prisma.skillProgress.findMany({ where: { userId } })
}

export async function upsertSkillProgress(params: {
  userId: string
  area: string
  topic: string
  isCorrect: boolean
}): Promise<void> {
  const { userId, area, topic, isCorrect } = params

  const existing = await prisma.skillProgress.findUnique({
    where: { userId_area_topic: { userId, area, topic } },
  })

  const newTotal = (existing?.total ?? 0) + 1
  const newCorrect = (existing?.correct ?? 0) + (isCorrect ? 1 : 0)
  const newAccuracy = newCorrect / newTotal

  await prisma.skillProgress.upsert({
    where: { userId_area_topic: { userId, area, topic } },
    create: {
      userId,
      area,
      topic,
      total: newTotal,
      correct: newCorrect,
      accuracy: newAccuracy,
    },
    update: {
      total: newTotal,
      correct: newCorrect,
      accuracy: newAccuracy,
    },
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/repositories/answer.repository.ts src/repositories/skill-progress.repository.ts
git commit -m "feat: add answer and skill-progress repositories"
```

---

## Phase 4 — Services (with Tests)

### Task 9: Dashboard Service

**Files:**
- Create: `src/services/dashboard.service.ts`
- Create: `src/services/__tests__/dashboard.service.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/services/__tests__/dashboard.service.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { calcEnergiaNeuralPct, calcMemoriaLongoPrazoPct } from "../dashboard.service"

describe("calcEnergiaNeuralPct", () => {
  it("returns 0 for inactive user", () => {
    expect(calcEnergiaNeuralPct({ streakDays: 0, recentAnswers: 0 })).toBe(0)
  })

  it("caps at 100", () => {
    expect(calcEnergiaNeuralPct({ streakDays: 30, recentAnswers: 100 })).toBe(100)
  })

  it("calculates correctly for active user", () => {
    // streakDays * 5 + recentAnswers * 2 = 3*5 + 10*2 = 35
    expect(calcEnergiaNeuralPct({ streakDays: 3, recentAnswers: 10 })).toBe(35)
  })
})

describe("calcMemoriaLongoPrazoPct", () => {
  it("returns 0 for empty skill progress", () => {
    expect(calcMemoriaLongoPrazoPct([])).toBe(0)
  })

  it("calculates weighted average accuracy", () => {
    const progress = [
      { accuracy: 0.8, total: 10 },
      { accuracy: 0.6, total: 10 },
    ]
    // (0.8*10 + 0.6*10) / 20 = 0.7 → 70
    expect(calcMemoriaLongoPrazoPct(progress)).toBe(70)
  })
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm test -- src/services/__tests__/dashboard.service.test.ts
```

Expected: FAIL — `calcEnergiaNeuralPct is not a function`

- [ ] **Step 3: Create `src/services/dashboard.service.ts`**

```typescript
import type { DashboardData, AreaSummary } from "@/models/user.model"
import { findUserById } from "@/repositories/user.repository"
import { findAllSkillProgress } from "@/repositories/skill-progress.repository"
import { countRecentAnswers } from "@/repositories/answer.repository"

export function calcEnergiaNeuralPct(params: {
  streakDays: number
  recentAnswers: number
}): number {
  return Math.min(100, params.streakDays * 5 + params.recentAnswers * 2)
}

export function calcMemoriaLongoPrazoPct(
  progress: readonly { accuracy: number; total: number }[]
): number {
  if (progress.length === 0) return 0
  const totalAnswers = progress.reduce((sum, p) => sum + p.total, 0)
  if (totalAnswers === 0) return 0
  const weighted = progress.reduce((sum, p) => sum + p.accuracy * p.total, 0)
  return Math.round((weighted / totalAnswers) * 100)
}

export async function getDashboardData(userId: string): Promise<DashboardData | null> {
  const user = await findUserById(userId)
  if (!user) return null

  const skillProgress = await findAllSkillProgress(userId)
  const recentAnswers = await countRecentAnswers(userId, 7)

  const energiaNeuralPct = calcEnergiaNeuralPct({
    streakDays: user.streakDays,
    recentAnswers,
  })
  const memoriaLongoPrazoPct = calcMemoriaLongoPrazoPct(skillProgress)

  const areaMap = new Map<string, { total: number; correctSum: number }>()
  for (const sp of skillProgress) {
    const existing = areaMap.get(sp.area) ?? { total: 0, correctSum: 0 }
    areaMap.set(sp.area, {
      total: existing.total + sp.total,
      correctSum: existing.correctSum + sp.correct,
    })
  }

  const skillSummary: AreaSummary[] = Array.from(areaMap.entries()).map(
    ([area, { total, correctSum }]) => ({
      area,
      accuracy: total > 0 ? correctSum / total : 0,
      total,
    })
  )

  return { user, energiaNeuralPct, memoriaLongoPrazoPct, skillSummary }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- src/services/__tests__/dashboard.service.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/services/dashboard.service.ts src/services/__tests__/dashboard.service.test.ts
git commit -m "feat: add dashboard service with cognitive attribute calculations"
```

---

### Task 10: Answer Service (XP + Streak + Gamification)

**Files:**
- Create: `src/services/answer.service.ts`
- Create: `src/services/__tests__/answer.service.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/services/__tests__/answer.service.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { calcXpEarned, calcNewLevel, calcNewStreak, LEVEL_THRESHOLDS } from "../answer.service"

describe("calcXpEarned", () => {
  it("gives 10 XP for correct answer with no streak", () => {
    expect(calcXpEarned({ isCorrect: true, consecutiveCorrect: 0 })).toBe(10)
  })

  it("gives 3 XP for wrong answer", () => {
    expect(calcXpEarned({ isCorrect: false, consecutiveCorrect: 0 })).toBe(3)
  })

  it("adds 5 XP bonus after 3 consecutive correct answers", () => {
    expect(calcXpEarned({ isCorrect: true, consecutiveCorrect: 3 })).toBe(15)
  })
})

describe("calcNewLevel", () => {
  it("stays at level 1 with 0 XP", () => {
    expect(calcNewLevel(0)).toBe(1)
  })

  it("advances to level 2 at 100 XP", () => {
    expect(calcNewLevel(100)).toBe(2)
  })

  it("advances to level 3 at 250 XP", () => {
    expect(calcNewLevel(250)).toBe(3)
  })
})

describe("calcNewStreak", () => {
  it("increments streak when last studied was yesterday", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    expect(calcNewStreak({ currentStreak: 5, lastStudiedAt: yesterday })).toBe(6)
  })

  it("keeps streak at 1 when last studied was today", () => {
    const today = new Date()
    expect(calcNewStreak({ currentStreak: 5, lastStudiedAt: today })).toBe(5)
  })

  it("resets streak to 1 when last studied was 2+ days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    expect(calcNewStreak({ currentStreak: 5, lastStudiedAt: twoDaysAgo })).toBe(1)
  })

  it("starts streak at 1 when no previous study", () => {
    expect(calcNewStreak({ currentStreak: 0, lastStudiedAt: null })).toBe(1)
  })
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm test -- src/services/__tests__/answer.service.test.ts
```

Expected: FAIL — `calcXpEarned is not a function`

- [ ] **Step 3: Create `src/services/answer.service.ts`**

```typescript
import type { SubmitAnswerInput, AnswerResult } from "@/models/answer.model"
import { findUserById } from "@/repositories/user.repository"
import { findQuestionById } from "@/repositories/question.repository"
import { createAnswer } from "@/repositories/answer.repository"
import { upsertSkillProgress } from "@/repositories/skill-progress.repository"
import { updateUserProgress } from "@/repositories/user.repository"

export const LEVEL_THRESHOLDS: readonly number[] = (() => {
  const thresholds = [0]
  for (let n = 2; n <= 50; n++) {
    thresholds.push(thresholds[n - 2] + n * 100)
  }
  return thresholds
})()

export function calcXpEarned(params: {
  isCorrect: boolean
  consecutiveCorrect: number
}): number {
  if (!params.isCorrect) return 3
  const bonus = params.consecutiveCorrect >= 3 ? 5 : 0
  return 10 + bonus
}

export function calcNewLevel(totalXp: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return level
}

export function calcNewStreak(params: {
  currentStreak: number
  lastStudiedAt: Date | null
}): number {
  const { currentStreak, lastStudiedAt } = params
  if (!lastStudiedAt) return 1

  const now = new Date()
  const diffMs = now.getTime() - lastStudiedAt.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < 1) return currentStreak       // already studied today
  if (diffDays < 2) return currentStreak + 1   // studied yesterday
  return 1                                      // streak broken
}

export async function submitAnswer(
  userId: string,
  input: SubmitAnswerInput,
  consecutiveCorrect: number
): Promise<AnswerResult> {
  const [user, question] = await Promise.all([
    findUserById(userId),
    findQuestionById(input.questionId),
  ])

  if (!user || !question) throw new Error("User or question not found")

  const isCorrect = question.correctKey === input.chosenKey
  const xpEarned = calcXpEarned({ isCorrect, consecutiveCorrect })
  const newXp = user.xp + xpEarned
  const newLevel = calcNewLevel(newXp)
  const newStreakDays = calcNewStreak({
    currentStreak: user.streakDays,
    lastStudiedAt: user.lastStudiedAt,
  })

  await Promise.all([
    createAnswer({
      userId,
      questionId: input.questionId,
      chosenKey: input.chosenKey,
      isCorrect,
      xpEarned,
    }),
    upsertSkillProgress({
      userId,
      area: question.area,
      topic: question.topic,
      isCorrect,
    }),
    updateUserProgress(userId, {
      xp: newXp,
      level: newLevel,
      streakDays: newStreakDays,
      lastStudiedAt: new Date(),
    }),
  ])

  return {
    isCorrect,
    xpEarned,
    correctKey: question.correctKey,
    newXp,
    newLevel,
    newStreakDays,
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- src/services/__tests__/answer.service.test.ts
```

Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/services/answer.service.ts src/services/__tests__/answer.service.test.ts
git commit -m "feat: add answer service with XP, level, and streak calculations"
```

---

### Task 11: Challenge Service

**Files:**
- Create: `src/services/challenge.service.ts`
- Create: `src/services/__tests__/challenge.service.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/services/__tests__/challenge.service.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { getWeakTopics } from "../challenge.service"
import type { SkillProgressEntry } from "@/models/skill-progress.model"

describe("getWeakTopics", () => {
  it("returns topics with accuracy below 0.6", () => {
    const progress: SkillProgressEntry[] = [
      { area: "Matemática", topic: "Funções", accuracy: 0.4, total: 10, correct: 4 },
      { area: "Matemática", topic: "Geometria", accuracy: 0.8, total: 10, correct: 8 },
      { area: "Humanas", topic: "História", accuracy: 0.5, total: 10, correct: 5 },
    ]
    expect(getWeakTopics(progress)).toEqual(["Funções", "História"])
  })

  it("returns all topics when no progress yet", () => {
    expect(getWeakTopics([])).toEqual([])
  })
})
```

- [ ] **Step 2: Run failing tests**

```bash
npm test -- src/services/__tests__/challenge.service.test.ts
```

Expected: FAIL — `getWeakTopics is not a function`

- [ ] **Step 3: Create `src/services/challenge.service.ts`**

```typescript
import type { Question } from "@/models/question.model"
import type { SkillProgressEntry } from "@/models/skill-progress.model"
import {
  findQuestionsForChallenge,
  findRecentlyAnsweredQuestionIds,
} from "@/repositories/question.repository"
import { findAllSkillProgress } from "@/repositories/skill-progress.repository"

const CHALLENGE_SIZE = 10
const AVOID_REPEAT_DAYS = 7
const WEAK_THRESHOLD = 0.6

export function getWeakTopics(progress: readonly SkillProgressEntry[]): string[] {
  return progress
    .filter((p) => p.accuracy < WEAK_THRESHOLD)
    .map((p) => p.topic)
}

export async function buildChallengeSession(
  userId: string
): Promise<Question[]> {
  const [skillProgress, recentIds] = await Promise.all([
    findAllSkillProgress(userId),
    findRecentlyAnsweredQuestionIds(userId, AVOID_REPEAT_DAYS),
  ])

  const weakTopics = getWeakTopics(skillProgress)

  return findQuestionsForChallenge({
    userId,
    weakTopics,
    avoidQuestionIds: recentIds,
    limit: CHALLENGE_SIZE,
  })
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- src/services/__tests__/challenge.service.test.ts
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/services/challenge.service.ts src/services/__tests__/challenge.service.test.ts
git commit -m "feat: add challenge service with weak-topic-first question selection"
```

---

### Task 12: Skill Tree + User Services

**Files:**
- Create: `src/services/skill-tree.service.ts`
- Create: `src/services/user.service.ts`

- [ ] **Step 1: Create `src/services/skill-tree.service.ts`**

```typescript
import type { SkillTreeData, AreaProgress } from "@/models/skill-progress.model"
import { findAllSkillProgress } from "@/repositories/skill-progress.repository"

export async function getSkillTreeData(userId: string): Promise<SkillTreeData> {
  const progress = await findAllSkillProgress(userId)

  const areaMap = new Map<string, AreaProgress>()

  for (const p of progress) {
    const existing = areaMap.get(p.area)
    if (!existing) {
      areaMap.set(p.area, {
        area: p.area,
        accuracy: p.accuracy,
        total: p.total,
        topics: [p],
      })
    } else {
      const newTotal = existing.total + p.total
      const newCorrect = existing.topics.reduce((s, t) => s + t.correct, 0) + p.correct
      areaMap.set(p.area, {
        area: p.area,
        accuracy: newTotal > 0 ? newCorrect / newTotal : 0,
        total: newTotal,
        topics: [...existing.topics, p],
      })
    }
  }

  return { areas: Array.from(areaMap.values()) }
}
```

- [ ] **Step 2: Create `src/services/user.service.ts`**

```typescript
import bcrypt from "bcryptjs"
import {
  createUserWithPassword,
  updateUserOnboarding,
  findUserByEmail,
} from "@/repositories/user.repository"
import type { UserProfile } from "@/models/user.model"

export async function registerUser(data: {
  email: string
  name: string
  password: string
}): Promise<UserProfile> {
  const existing = await findUserByEmail(data.email)
  if (existing) throw new Error("Email already in use")

  const passwordHash = await bcrypt.hash(data.password, 12)
  return createUserWithPassword({ email: data.email, name: data.name, passwordHash })
}

export async function saveOnboardingTarget(
  userId: string,
  targetScore: number
): Promise<void> {
  const valid = [500, 600, 700, 800, 900]
  if (!valid.includes(targetScore)) throw new Error("Invalid target score")
  await updateUserOnboarding(userId, targetScore)
}
```

- [ ] **Step 3: Commit**

```bash
git add src/services/skill-tree.service.ts src/services/user.service.ts
git commit -m "feat: add skill-tree and user services"
```

---

## Phase 5 — API Route Handlers

### Task 13: User Routes

**Files:**
- Create: `app/api/v1/users/me/route.ts`
- Create: `app/api/v1/users/me/onboarding/route.ts`

- [ ] **Step 1: Create `app/api/v1/users/me/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { findUserById } from "@/repositories/user.repository"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await findUserById(session.user.id)
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(user)
}
```

- [ ] **Step 2: Create `app/api/v1/users/me/onboarding/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { saveOnboardingTarget } from "@/services/user.service"

const schema = z.object({
  targetScore: z.number().int().min(500).max(900).step(100),
})

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await saveOnboardingTarget(session.user.id, parsed.data.targetScore)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/users/
git commit -m "feat: add user API routes (GET /me, PUT /me/onboarding)"
```

---

### Task 14: Dashboard + Challenges + Skill Tree Routes

**Files:**
- Create: `app/api/v1/dashboard/route.ts`
- Create: `app/api/v1/challenges/next/route.ts`
- Create: `app/api/v1/skill-tree/route.ts`

- [ ] **Step 1: Create `app/api/v1/dashboard/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDashboardData } from "@/services/dashboard.service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getDashboardData(session.user.id)
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(data)
}
```

- [ ] **Step 2: Create `app/api/v1/challenges/next/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { buildChallengeSession } from "@/services/challenge.service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const questions = await buildChallengeSession(session.user.id)
  return NextResponse.json({ questions })
}
```

- [ ] **Step 3: Create `app/api/v1/skill-tree/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSkillTreeData } from "@/services/skill-tree.service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getSkillTreeData(session.user.id)
  return NextResponse.json(data)
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/dashboard/ app/api/v1/challenges/ app/api/v1/skill-tree/
git commit -m "feat: add dashboard, challenges, and skill-tree API routes"
```

---

### Task 15: Answers Route

**Files:**
- Create: `app/api/v1/answers/route.ts`

- [ ] **Step 1: Create `app/api/v1/answers/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { submitAnswer } from "@/services/answer.service"

const schema = z.object({
  questionId: z.string().cuid(),
  chosenKey: z.string().length(1),
  consecutiveCorrect: z.number().int().min(0),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { questionId, chosenKey, consecutiveCorrect } = parsed.data
  const result = await submitAnswer(
    session.user.id,
    { questionId, chosenKey },
    consecutiveCorrect
  )

  return NextResponse.json(result)
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/answers/
git commit -m "feat: add answers POST route"
```

---

## Phase 6 — Client State + Hooks

### Task 16: Zustand Challenge Store + TanStack Query Setup

**Files:**
- Create: `src/store/challenge.store.ts`
- Create: `src/lib/query-client.ts`
- Create: `src/components/providers.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `src/store/challenge.store.ts`**

```typescript
import { create } from "zustand"
import type { Question } from "@/models/question.model"

interface SessionAnswer {
  readonly questionId: string
  readonly chosenKey: string
  readonly isCorrect: boolean
  readonly xpEarned: number
}

interface ChallengeStore {
  readonly questions: readonly Question[]
  readonly currentIndex: number
  readonly answers: readonly SessionAnswer[]
  readonly isComplete: boolean
  startSession: (questions: readonly Question[]) => void
  recordAnswer: (answer: SessionAnswer) => void
  endSession: () => void
}

export const useChallengeStore = create<ChallengeStore>((set) => ({
  questions: [],
  currentIndex: 0,
  answers: [],
  isComplete: false,

  startSession: (questions) =>
    set({ questions, currentIndex: 0, answers: [], isComplete: false }),

  recordAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
      currentIndex: state.currentIndex + 1,
      isComplete: state.currentIndex + 1 >= state.questions.length,
    })),

  endSession: () =>
    set({ questions: [], currentIndex: 0, answers: [], isComplete: false }),
}))
```

- [ ] **Step 2: Create `src/lib/query-client.ts`**

```typescript
import { QueryClient } from "@tanstack/react-query"

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
```

- [ ] **Step 3: Create `src/components/providers.tsx`**

```typescript
"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/query-client"

export function Providers({ children }: { readonly children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

- [ ] **Step 4: Update `app/layout.tsx`**

```typescript
import type { Metadata } from "next"
import { Public_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const publicSans = Public_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cortex ENEM",
  description: "Transformando estudo em progressão.",
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${publicSans.className} bg-zinc-950 text-zinc-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Create TanStack Query hooks**

Create `src/hooks/use-dashboard.ts`:

```typescript
import { useQuery } from "@tanstack/react-query"
import type { DashboardData } from "@/models/user.model"

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => fetch("/api/v1/dashboard").then((r) => r.json()),
  })
}
```

Create `src/hooks/use-challenge.ts`:

```typescript
import { useQuery } from "@tanstack/react-query"
import type { Question } from "@/models/question.model"

export function useNextChallenge(enabled: boolean) {
  return useQuery<{ questions: Question[] }>({
    queryKey: ["challenge", "next"],
    queryFn: () => fetch("/api/v1/challenges/next").then((r) => r.json()),
    enabled,
  })
}
```

Create `src/hooks/use-skill-tree.ts`:

```typescript
import { useQuery } from "@tanstack/react-query"
import type { SkillTreeData } from "@/models/skill-progress.model"

export function useSkillTree() {
  return useQuery<SkillTreeData>({
    queryKey: ["skill-tree"],
    queryFn: () => fetch("/api/v1/skill-tree").then((r) => r.json()),
  })
}
```

- [ ] **Step 6: Commit**

```bash
git add src/store/ src/lib/query-client.ts src/components/providers.tsx src/hooks/ app/layout.tsx
git commit -m "feat: add Zustand store, TanStack Query setup, and data hooks"
```

---

## Phase 7 — UI Pages

### Task 17: Auth Pages (Login + Register)

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Create `app/(auth)/login/page.tsx`**

```typescript
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)
    if (result?.error) {
      setError("Email ou senha inválidos.")
      return
    }
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Entrar no Cortex</h1>
          <p className="text-sm text-zinc-500">Fortaleça sua mente.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs text-zinc-500">
            <span className="bg-zinc-950 px-2">ou</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-zinc-800"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Entrar com Google
        </Button>

        <p className="text-center text-sm text-zinc-500">
          Não tem conta?{" "}
          <a href="/register" className="text-indigo-400 hover:underline">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/(auth)/register/page.tsx`**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar conta.")
      return
    }

    router.push("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Criar conta</h1>
          <p className="text-sm text-zinc-500">Comece a fortalecer seu cérebro.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600">
            {loading ? "Criando..." : "Criar conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <a href="/login" className="text-indigo-400 hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add register API route `app/api/v1/users/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { registerUser } from "@/services/user.service"

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const user = await registerUser(parsed.data)
    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 409 })
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/ app/api/v1/users/route.ts
git commit -m "feat: add login, register pages and register API route"
```

---

### Task 18: Onboarding Page

**Files:**
- Create: `app/(app)/onboarding/page.tsx`
- Create: `app/(app)/layout.tsx`

- [ ] **Step 1: Create `app/(app)/layout.tsx`**

```typescript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")
  return <>{children}</>
}
```

- [ ] **Step 2: Create `app/(app)/onboarding/page.tsx`**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const TARGETS = [500, 600, 700, 800, 900] as const

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!selected) return
    setLoading(true)

    await fetch("/api/v1/users/me/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetScore: selected }),
    })

    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4">
      <div className="space-y-2 text-center">
        <p className="text-4xl">🧠</p>
        <h1 className="text-2xl font-semibold">Qual é a sua meta no ENEM?</h1>
        <p className="text-sm text-zinc-500">
          Isso ajuda o Cortex a calibrar seus desafios.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {TARGETS.map((score) => (
          <button
            key={score}
            onClick={() => setSelected(score)}
            className={`rounded-lg border px-6 py-4 text-lg font-semibold transition-colors ${
              selected === score
                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                : "border-zinc-800 bg-zinc-900 text-zinc-100 hover:border-zinc-600"
            }`}
          >
            {score}+
          </button>
        ))}
      </div>

      <Button
        onClick={handleConfirm}
        disabled={!selected || loading}
        className="w-48 bg-indigo-500 hover:bg-indigo-600"
      >
        {loading ? "Salvando..." : "Começar"}
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/layout.tsx app/\(app\)/onboarding/
git commit -m "feat: add app layout with session guard and onboarding page"
```

---

### Task 19: Brain Status Component + Dashboard Page

**Files:**
- Create: `src/components/brain-status/brain-status.tsx`
- Create: `src/components/skill-card/skill-card.tsx`
- Create: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Create `src/components/brain-status/brain-status.tsx`**

```typescript
import { Progress } from "@/components/ui/progress"

interface BrainStatusProps {
  readonly energiaNeuralPct: number
  readonly memoriaLongoPrazoPct: number
  readonly level: number
  readonly streakDays: number
  readonly xp: number
}

/** @description Central dashboard component showing cognitive brain state */
export function BrainStatus({
  energiaNeuralPct,
  memoriaLongoPrazoPct,
  level,
  streakDays,
  xp,
}: BrainStatusProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🧠</span>
        <h2 className="text-lg font-semibold">Seu Cérebro</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-zinc-500">Nível Geral</p>
          <p className="text-xl font-bold text-indigo-400">{level}</p>
        </div>
        <div>
          <p className="text-zinc-500">Streak</p>
          <p className="text-xl font-bold">🔥 {streakDays} dias</p>
        </div>
        <div>
          <p className="text-zinc-500">XP Total</p>
          <p className="font-semibold">{xp.toLocaleString()} XP</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Energia Neural</span>
            <span className="text-indigo-400">{energiaNeuralPct}%</span>
          </div>
          <Progress value={energiaNeuralPct} className="h-2 bg-zinc-800" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Memória de Longo Prazo</span>
            <span className="text-indigo-400">{memoriaLongoPrazoPct}%</span>
          </div>
          <Progress value={memoriaLongoPrazoPct} className="h-2 bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/skill-card/skill-card.tsx`**

```typescript
import { Progress } from "@/components/ui/progress"
import type { AreaSummary } from "@/models/user.model"

interface SkillCardProps {
  readonly area: AreaSummary
}

const AREA_LABELS: Record<string, string> = {
  Matemática: "Matemática",
  Humanas: "Humanas",
  Natureza: "Natureza",
  Linguagens: "Linguagens",
}

/** @description Compact area progress card for dashboard skill overview */
export function SkillCard({ area }: SkillCardProps) {
  const pct = Math.round(area.accuracy * 100)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{AREA_LABELS[area.area] ?? area.area}</span>
        <span className="text-zinc-500">{area.total} questões</span>
      </div>
      <div className="space-y-1">
        <Progress value={pct} className="h-1.5 bg-zinc-800" />
        <p className="text-right text-xs text-indigo-400">{pct}%</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/(app)/dashboard/page.tsx`**

```typescript
"use client"

import { useRouter } from "next/navigation"
import { useDashboard } from "@/hooks/use-dashboard"
import { BrainStatus } from "@/components/brain-status/brain-status"
import { SkillCard } from "@/components/skill-card/skill-card"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const { data, isPending } = useDashboard()

  useEffect(() => {
    if (data && data.user.targetScore === null) {
      router.push("/onboarding")
    }
  }, [data, router])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <BrainStatus
        energiaNeuralPct={data.energiaNeuralPct}
        memoriaLongoPrazoPct={data.memoriaLongoPrazoPct}
        level={data.user.level}
        streakDays={data.user.streakDays}
        xp={data.user.xp}
      />

      <Button
        onClick={() => router.push("/desafio")}
        className="w-full bg-indigo-500 hover:bg-indigo-600 h-14 text-base font-semibold"
      >
        COMEÇAR DESAFIO
      </Button>

      {data.skillSummary.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-400">Evolução por Área</h3>
          <div className="grid grid-cols-2 gap-3">
            {data.skillSummary.map((area) => (
              <SkillCard key={area.area} area={area} />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => router.push("/skill-tree")}
        className="text-sm text-zinc-500 hover:text-zinc-300 transition-opacity"
      >
        Ver Skill Tree completa →
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/brain-status/ src/components/skill-card/ app/\(app\)/dashboard/
git commit -m "feat: add Brain Status component and Dashboard page"
```

---

### Task 20: Question Session + Desafio Page

**Files:**
- Create: `src/components/question-session/question-card.tsx`
- Create: `src/components/question-session/xp-feedback.tsx`
- Create: `src/components/question-session/question-session.tsx`
- Create: `app/(app)/desafio/page.tsx`

- [ ] **Step 1: Create `src/components/question-session/question-card.tsx`**

```typescript
import type { Question } from "@/models/question.model"

interface QuestionCardProps {
  readonly question: Question
  readonly onAnswer: (key: string) => void
  readonly disabled: boolean
  readonly selectedKey: string | null
  readonly correctKey: string | null
}

/** @description Renders a single ENEM question with answer alternatives */
export function QuestionCard({
  question,
  onAnswer,
  disabled,
  selectedKey,
  correctKey,
}: QuestionCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt="Imagem da questão"
            className="mb-4 w-full rounded"
          />
        )}
        <p className="text-sm leading-relaxed text-zinc-100">{question.statement}</p>
      </div>

      <div className="space-y-2">
        {question.alternatives.map((alt) => {
          let variant: "default" | "correct" | "wrong" | "neutral" = "default"
          if (correctKey) {
            if (alt.key === correctKey) variant = "correct"
            else if (alt.key === selectedKey) variant = "wrong"
            else variant = "neutral"
          }

          const styles = {
            default: "border-zinc-800 bg-zinc-900 hover:border-zinc-600",
            correct: "border-green-600 bg-green-950/30",
            wrong: "border-red-600 bg-red-950/30",
            neutral: "border-zinc-800 bg-zinc-900 opacity-50",
          }[variant]

          return (
            <button
              key={alt.key}
              disabled={disabled}
              onClick={() => onAnswer(alt.key)}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${styles}`}
            >
              <span className="font-semibold text-indigo-400 mr-2">{alt.key}.</span>
              {alt.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/question-session/xp-feedback.tsx`**

```typescript
interface XpFeedbackProps {
  readonly isCorrect: boolean
  readonly xpEarned: number
  readonly correctKey: string
}

/** @description Inline feedback shown after answering a question */
export function XpFeedback({ isCorrect, xpEarned, correctKey }: XpFeedbackProps) {
  return (
    <div
      className={`rounded-lg border p-3 text-sm flex items-center justify-between ${
        isCorrect
          ? "border-green-800 bg-green-950/30 text-green-400"
          : "border-zinc-800 bg-zinc-900 text-zinc-400"
      }`}
    >
      <span>
        {isCorrect ? "Correto!" : `Resposta Correta: ${correctKey}`}
      </span>
      <span className="font-semibold text-indigo-400">+{xpEarned} XP</span>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/question-session/question-session.tsx`**

```typescript
"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useChallengeStore } from "@/store/challenge.store"
import { QuestionCard } from "./question-card"
import { XpFeedback } from "./xp-feedback"
import { Button } from "@/components/ui/button"
import type { AnswerResult } from "@/models/answer.model"

interface QuestionSessionProps {
  readonly onComplete: () => void
}

/** @description Manages the full question session flow with XP feedback */
export function QuestionSession({ onComplete }: QuestionSessionProps) {
  const queryClient = useQueryClient()
  const { questions, currentIndex, answers, isComplete, recordAnswer, endSession } =
    useChallengeStore()

  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<AnswerResult | null>(null)
  const [loading, setLoading] = useState(false)

  const currentQuestion = questions[currentIndex]

  const consecutiveCorrect = [...answers]
    .reverse()
    .findIndex((a) => !a.isCorrect)

  async function handleAnswer(key: string) {
    if (feedback || loading) return
    setSelectedKey(key)
    setLoading(true)

    const res = await fetch("/api/v1/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        chosenKey: key,
        consecutiveCorrect: consecutiveCorrect === -1 ? answers.length : consecutiveCorrect,
      }),
    })

    const result: AnswerResult = await res.json()
    setFeedback(result)
    setLoading(false)

    recordAnswer({
      questionId: currentQuestion.id,
      chosenKey: key,
      isCorrect: result.isCorrect,
      xpEarned: result.xpEarned,
    })
  }

  function handleNext() {
    setSelectedKey(null)
    setFeedback(null)

    if (isComplete) {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      endSession()
      onComplete()
    }
  }

  if (!currentQuestion) return null

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-zinc-500">
        <span>
          {currentIndex + 1} / {questions.length}
        </span>
        <span>{answers.filter((a) => a.isCorrect).length} acertos</span>
      </div>

      <QuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        disabled={!!feedback || loading}
        selectedKey={selectedKey}
        correctKey={feedback?.correctKey ?? null}
      />

      {feedback && (
        <>
          <XpFeedback
            isCorrect={feedback.isCorrect}
            xpEarned={feedback.xpEarned}
            correctKey={feedback.correctKey}
          />
          <Button onClick={handleNext} className="w-full bg-indigo-500 hover:bg-indigo-600">
            {isComplete ? "Ver Resultado" : "Próxima"}
          </Button>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `app/(app)/desafio/page.tsx`**

```typescript
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useNextChallenge } from "@/hooks/use-challenge"
import { useChallengeStore } from "@/store/challenge.store"
import { QuestionSession } from "@/components/question-session/question-session"
import { Button } from "@/components/ui/button"

export default function DesafioPage() {
  const router = useRouter()
  const { questions, startSession, isComplete } = useChallengeStore()
  const { data, isPending, isError } = useNextChallenge(questions.length === 0)

  useEffect(() => {
    if (data && questions.length === 0) {
      startSession(data.questions)
    }
  }, [data, questions.length, startSession])

  if (isPending && questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Preparando desafio...</p>
      </div>
    )
  }

  if (isError || (data?.questions?.length === 0 && questions.length === 0)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Nenhuma questão disponível no momento.</p>
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Desafio</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          Sair
        </button>
      </div>

      <QuestionSession onComplete={() => router.push("/dashboard")} />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/question-session/ app/\(app\)/desafio/
git commit -m "feat: add question session components and desafio page"
```

---

### Task 21: Skill Tree Page

**Files:**
- Create: `app/(app)/skill-tree/page.tsx`

- [ ] **Step 1: Create `app/(app)/skill-tree/page.tsx`**

```typescript
"use client"

import { useRouter } from "next/navigation"
import { useSkillTree } from "@/hooks/use-skill-tree"
import { Progress } from "@/components/ui/progress"

export default function SkillTreePage() {
  const router = useRouter()
  const { data, isPending } = useSkillTree()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-zinc-500 hover:text-zinc-300 text-sm"
        >
          ← Voltar
        </button>
        <h1 className="text-lg font-semibold">Skill Tree</h1>
      </div>

      {!data || data.areas.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-500 text-sm">
            Complete seu primeiro desafio para ver sua evolução aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.areas.map((area) => (
            <div key={area.area} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{area.area}</h2>
                <span className="text-sm text-indigo-400">
                  {Math.round(area.accuracy * 100)}%
                </span>
              </div>
              <Progress value={Math.round(area.accuracy * 100)} className="h-1.5 bg-zinc-800" />

              <div className="space-y-2 pt-1">
                {area.topics.map((topic) => (
                  <div key={topic.topic} className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{topic.topic}</span>
                      <span>{topic.total} questões · {Math.round(topic.accuracy * 100)}%</span>
                    </div>
                    <Progress value={Math.round(topic.accuracy * 100)} className="h-1 bg-zinc-800" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/skill-tree/
git commit -m "feat: add skill tree page"
```

---

## Phase 8 — ENEM Question Importer

### Task 22: Import Script

**Files:**
- Create: `scripts/import-questions.ts`

- [ ] **Step 1: Check API base URL**

Visit `https://docs.enem.dev` and confirm the base URL for the API. Update `BASE_URL` in the script below accordingly.

- [ ] **Step 2: Create `scripts/import-questions.ts`**

```typescript
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const BASE_URL = "https://api.enem.dev/v1" // confirm at docs.enem.dev

const TOPIC_MAP: Record<string, { topic: string; subtopic: string }> = {
  Matemática: { topic: "Matemática Geral", subtopic: "Sem classificação" },
  "Ciências Humanas": { topic: "Humanas Geral", subtopic: "Sem classificação" },
  "Ciências da Natureza": { topic: "Natureza Geral", subtopic: "Sem classificação" },
  Linguagens: { topic: "Linguagens Geral", subtopic: "Sem classificação" },
}

function normalizeArea(discipline: string): string {
  if (discipline.includes("Matemática")) return "Matemática"
  if (discipline.includes("Humanas")) return "Humanas"
  if (discipline.includes("Natureza")) return "Natureza"
  if (discipline.includes("Linguagens")) return "Linguagens"
  return discipline
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(url: string, retries = 3): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url)
    if (res.status === 429) {
      console.log("Rate limited — waiting 3s...")
      await delay(3000)
      continue
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return res.json()
  }
  throw new Error(`Failed after ${retries} retries: ${url}`)
}

async function importYear(year: number) {
  console.log(`\nImporting year ${year}...`)
  const data = (await fetchWithRetry(`${BASE_URL}/exams/${year}/questions`)) as {
    questions: Array<{
      index: number
      discipline: string
      context: string
      files: string[]
      alternatives: Array<{ letter: string; text: string }>
      correctAlternative: string
    }>
  }

  const questions = data.questions ?? []
  console.log(`  Found ${questions.length} questions`)

  for (const q of questions) {
    const area = normalizeArea(q.discipline ?? "")
    const { topic, subtopic } = TOPIC_MAP[area] ?? {
      topic: "Outros",
      subtopic: "Sem classificação",
    }

    await prisma.question.upsert({
      where: { externalId: `${year}-${q.index}` },
      create: {
        externalId: `${year}-${q.index}`,
        year,
        index: q.index,
        area,
        topic,
        subtopic,
        statement: q.context ?? "",
        alternatives: q.alternatives.map((a) => ({
          key: a.letter,
          text: a.text,
        })),
        correctKey: q.correctAlternative,
        imageUrl: q.files?.[0] ?? null,
      },
      update: {},
    })

    await delay(1100) // respect 1 req/sec rate limit
  }

  console.log(`  Done importing ${year}`)
}

async function main() {
  const exams = (await fetchWithRetry(`${BASE_URL}/exams`)) as {
    exams: Array<{ year: number }>
  }

  const years = (exams.exams ?? []).map((e) => e.year).sort()
  console.log(`Found exams for years: ${years.join(", ")}`)

  for (const year of years) {
    await importYear(year)
  }

  console.log("\nImport complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 3: Add import script to `package.json`**

```json
"import-questions": "npx tsx scripts/import-questions.ts"
```

Install `tsx`:
```bash
npm install -D tsx
```

- [ ] **Step 4: Run a dry-run test (single year)**

Temporarily change the `for` loop in `main()` to only run one year:

```typescript
for (const year of years.slice(0, 1)) {
```

Then run:
```bash
npm run import-questions
```

Expected: console shows questions being imported for the first year. Check database:

```bash
npx prisma studio
```

Navigate to Question table — should have rows.

- [ ] **Step 5: Revert dry-run change and commit**

Revert `years.slice(0, 1)` back to `years`. Then:

```bash
git add scripts/import-questions.ts package.json
git commit -m "feat: add ENEM question importer script"
```

---

## Phase 9 — Final Verification

### Task 23: Run All Tests + Smoke Test

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all service tests pass (dashboard, answer, challenge — 12+ tests total).

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Expected: server starts on `http://localhost:3000`.

- [ ] **Step 3: Smoke test golden path**

1. Open `http://localhost:3000` — should redirect to `/login`
2. Register a new account at `/register`
3. Login at `/login`
4. Complete onboarding — choose a target score
5. Verify `/dashboard` loads with Brain Status (0% attributes initially)
6. Click "COMEÇAR DESAFIO" — should redirect to `/desafio`
   - Note: if no questions exist, run `npm run import-questions` first
7. Answer a question — verify XP feedback appears
8. Complete session — verify redirect to `/dashboard` and XP updated
9. Visit `/skill-tree` — verify area progress appears

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify MVP implementation complete"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Auth (Google + Email/senha)
- ✅ Onboarding (meta única)
- ✅ Dashboard (Brain Status, XP, streak, skill cards)
- ✅ Desafio (seleção automática, sessão de questões, feedback XP)
- ✅ Skill Tree (por área e tópico)
- ✅ Gamificação (XP, levels, streak, sequência de bônus)
- ✅ Atributos cognitivos (Energia Neural, Memória)
- ✅ ENEM Importer
- ✅ Prisma schema com Auth.js adapter tables
- ✅ Route Handlers com Zod validation
- ✅ TanStack Query + Zustand
- ✅ Mobile-first dark theme (zinc palette + indigo accent)

**Out of scope (not implemented):** ranking, social, IA, conquistas dedicadas, nota estimada — conforme spec.

**Nota estimada** está listada no dashboard do CONTEXT.md mas não foi implementada — o cálculo requer histórico suficiente de respostas e uma fórmula validada. Recomendado como fase 2 após validar o MVP.
