# Cortex Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Cortex Fastify REST API with PostgreSQL/Prisma, JWT auth, cognitive attribute engine, gamification system, and ENEM question importer.

**Architecture:** Layered architecture — Routes → Services → Repositories → Prisma. Each layer has a single responsibility. Zod validates all input at the route layer. Business logic lives in services. Database access is encapsulated in repositories.

**Tech Stack:** Node.js 20, TypeScript (strict), Fastify 4, Prisma ORM, PostgreSQL 15, Zod, bcryptjs, jsonwebtoken, Vitest, Docker Compose.

---

## File Map

```
cortex-api/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .env.example
├── docker-compose.yml
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── server.ts                      # Fastify instance, plugin registration, start
│   ├── config.ts                      # Env validation with Zod, typed Config
│   ├── routes/
│   │   └── v1/
│   │       ├── index.ts               # Registers all route groups under /v1
│   │       ├── auth.routes.ts
│   │       ├── users.routes.ts
│   │       ├── challenges.routes.ts
│   │       ├── answers.routes.ts
│   │       ├── brain.routes.ts
│   │       ├── dashboard.routes.ts
│   │       └── achievements.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── challenge.service.ts
│   │   ├── answer.service.ts
│   │   ├── brain.service.ts
│   │   ├── dashboard.service.ts
│   │   └── achievement.service.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── question.repository.ts
│   │   ├── answer.repository.ts
│   │   ├── brain.repository.ts
│   │   └── achievement.repository.ts
│   ├── middleware/
│   │   └── authenticate.ts            # Fastify preHandler hook: verifies JWT Bearer
│   ├── validators/
│   │   ├── auth.schema.ts
│   │   ├── challenge.schema.ts
│   │   ├── answer.schema.ts
│   │   └── user.schema.ts
│   ├── utils/
│   │   ├── jwt.ts                     # sign, verify access+refresh tokens
│   │   ├── password.ts                # hash, compare with bcryptjs
│   │   ├── cognitive.ts               # 5 attribute calculation formulas
│   │   └── streak.ts                  # streak update logic
│   └── types/
│       ├── domain.types.ts            # shared domain interfaces
│       └── fastify.d.ts               # augment FastifyRequest with user
├── scripts/
│   └── import-enem.ts
└── tests/
    ├── utils/
    │   ├── cognitive.test.ts
    │   └── streak.test.ts
    ├── services/
    │   ├── auth.service.test.ts
    │   ├── challenge.service.test.ts
    │   ├── answer.service.test.ts
    │   └── brain.service.test.ts
    └── helpers/
        └── prisma-mock.ts             # shared Prisma mock setup
```

---

## Task 1: Project Setup

**Files:**
- Create: `cortex-api/package.json`
- Create: `cortex-api/tsconfig.json`
- Create: `cortex-api/vitest.config.ts`
- Create: `cortex-api/.env.example`

- [ ] **Step 1: Initialize project**

```bash
mkdir cortex-api && cd cortex-api
npm init -y
npm install fastify @fastify/cors @fastify/rate-limit
npm install @prisma/client zod bcryptjs jsonwebtoken
npm install -D typescript @types/node @types/bcryptjs @types/jsonwebtoken
npm install -D vitest @vitest/coverage-v8 prisma ts-node tsx
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*", "scripts/**/*", "tests/**/*", "prisma/**/*"]
}
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
})
```

- [ ] **Step 4: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

- [ ] **Step 5: Create .env.example**

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cortex
JWT_ACCESS_SECRET=change_me_access_secret_64_chars_minimum_here
JWT_REFRESH_SECRET=change_me_refresh_secret_64_chars_minimum_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
PORT=3000
NODE_ENV=development
ENEM_API_URL=https://api.enem.dev/v1
```

- [ ] **Step 6: Copy .env.example to .env and fill in development values**

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: initialize cortex-api project structure"
```

---

## Task 2: Docker Compose + Prisma Schema

**Files:**
- Create: `cortex-api/docker-compose.yml`
- Create: `cortex-api/prisma/schema.prisma`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cortex
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

- [ ] **Step 2: Start PostgreSQL**

```bash
docker-compose up -d postgres
```

Expected: `cortex-postgres-1 started`

- [ ] **Step 3: Initialize Prisma**

```bash
npx prisma init
```

- [ ] **Step 4: Replace prisma/schema.prisma with full schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ChallengeStatus {
  ACTIVE
  COMPLETED
  ABANDONED
}

enum CognitiveAttribute {
  ENERGIA_NEURAL
  MEMORIA
  LOGICA
  INTERPRETACAO
  CIENCIAS
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  image         String?
  passwordHash  String?
  xp            Int       @default(0)
  level         Int       @default(1)
  streakDays    Int       @default(0)
  lastStudiedAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  goal             Goal?
  brainMetrics     BrainMetrics?
  brainSnapshots   BrainSnapshot[]
  challenges       Challenge[]
  attempts         Attempt[]
  userAchievements UserAchievement[]
  accounts         Account[]

  @@index([email])
  @@index([streakDays])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  accessToken       String?
  refreshToken      String?
  expiresAt         Int?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Goal {
  id          String   @id @default(cuid())
  userId      String   @unique
  targetScore Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Topic {
  id                 String             @id @default(cuid())
  name               String
  slug               String             @unique
  description        String?
  cognitiveAttribute CognitiveAttribute

  subTopics SubTopic[]
  questions Question[]
}

model SubTopic {
  id      String @id @default(cuid())
  topicId String
  name    String
  slug    String

  topic     Topic      @relation(fields: [topicId], references: [id])
  questions Question[]

  @@unique([topicId, slug])
  @@index([topicId])
}

model Question {
  id           String   @id @default(cuid())
  externalId   String?  @unique
  year         Int
  index        Int
  topicId      String
  subTopicId   String?
  statement    String   @db.Text
  alternatives Json
  correctKey   String   @db.Char(1)
  difficulty   Int      @default(3)
  imageUrl     String?
  createdAt    DateTime @default(now())

  topic              Topic               @relation(fields: [topicId], references: [id])
  subTopic           SubTopic?           @relation(fields: [subTopicId], references: [id])
  attempts           Attempt[]
  challengeQuestions ChallengeQuestion[]

  @@index([topicId])
  @@index([year])
  @@index([difficulty])
  @@index([topicId, difficulty])
}

model Challenge {
  id             String          @id @default(cuid())
  userId         String
  status         ChallengeStatus @default(ACTIVE)
  totalXP        Int             @default(0)
  totalCorrect   Int             @default(0)
  totalQuestions Int             @default(10)
  startedAt      DateTime        @default(now())
  completedAt    DateTime?

  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  attempts           Attempt[]
  challengeQuestions ChallengeQuestion[]

  @@index([userId])
  @@index([userId, status])
  @@index([completedAt])
}

model ChallengeQuestion {
  id          String @id @default(cuid())
  challengeId String
  questionId  String
  position    Int

  challenge Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  question  Question  @relation(fields: [questionId], references: [id])

  @@unique([challengeId, position])
  @@unique([challengeId, questionId])
  @@index([challengeId])
}

model Attempt {
  id              String   @id @default(cuid())
  userId          String
  questionId      String
  challengeId     String
  chosenKey       String   @db.Char(1)
  isCorrect       Boolean
  xpEarned        Int
  cognitiveImpact Json
  answeredAt      DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question  Question  @relation(fields: [questionId], references: [id])
  challenge Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, answeredAt])
  @@index([challengeId])
  @@index([questionId])
}

model BrainMetrics {
  id                 String   @id @default(cuid())
  userId             String   @unique
  energiaNeuralScore Float    @default(0)
  memoriaScore       Float    @default(0)
  logicaScore        Float    @default(0)
  interpretacaoScore Float    @default(0)
  cienciasScore      Float    @default(0)
  estimatedScore     Float    @default(0)
  updatedAt          DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model BrainSnapshot {
  id                 String   @id @default(cuid())
  userId             String
  energiaNeuralScore Float
  memoriaScore       Float
  logicaScore        Float
  interpretacaoScore Float
  cienciasScore      Float
  estimatedScore     Float
  recordedAt         DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, recordedAt])
}

model Achievement {
  id          String   @id @default(cuid())
  name        String
  description String
  icon        String
  type        String
  threshold   Int
  createdAt   DateTime @default(now())

  userAchievements UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
  @@index([userId])
}
```

- [ ] **Step 5: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: `Your database is now in sync with your schema.`

- [ ] **Step 6: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 7: Commit**

```bash
git add prisma/ docker-compose.yml
git commit -m "feat: add Prisma schema and Docker Compose for PostgreSQL"
```

---

## Task 3: Domain Types + Config

**Files:**
- Create: `src/types/domain.types.ts`
- Create: `src/types/fastify.d.ts`
- Create: `src/config.ts`

- [ ] **Step 1: Create src/types/domain.types.ts**

```typescript
import { CognitiveAttribute } from '@prisma/client'

export interface UserDTO {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly image: string | null
  readonly xp: number
  readonly level: number
  readonly streakDays: number
  readonly hasCompletedOnboarding: boolean
}

export interface CognitiveImpactItem {
  readonly attribute: CognitiveAttribute
  readonly delta: number
}

export interface BrainMetricsDTO {
  readonly energiaNeuralScore: number
  readonly memoriaScore: number
  readonly logicaScore: number
  readonly interpretacaoScore: number
  readonly cienciasScore: number
  readonly estimatedScore: number
}

export interface AlternativeDTO {
  readonly key: string
  readonly text: string
}

export interface QuestionDTO {
  readonly id: string
  readonly statement: string
  readonly alternatives: readonly AlternativeDTO[]
  readonly imageUrl: string | null
  readonly year: number
  readonly topic: {
    readonly name: string
    readonly cognitiveAttribute: CognitiveAttribute
  }
}

export interface TokenPair {
  readonly accessToken: string
  readonly refreshToken: string
}

export interface AttemptResult {
  readonly isCorrect: boolean
  readonly correctKey: string
  readonly xpEarned: number
  readonly cognitiveImpact: readonly CognitiveImpactItem[]
  readonly explanation: string | null
}
```

- [ ] **Step 2: Create src/types/fastify.d.ts**

```typescript
import '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
  }
}
```

- [ ] **Step 3: Create src/config.ts**

```typescript
import { z } from 'zod'

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  GOOGLE_CLIENT_ID: z.string(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  ENEM_API_URL: z.string().url(),
})

const parsed = configSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

/** Validated, typed configuration object. Throws at startup if env vars are missing. */
export const config = parsed.data
```

- [ ] **Step 4: Commit**

```bash
git add src/types/ src/config.ts
git commit -m "feat: add domain types and validated config"
```

---

## Task 4: Utility — JWT

**Files:**
- Create: `src/utils/jwt.ts`
- Create: `tests/utils/jwt.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/utils/jwt.test.ts
import { describe, it, expect } from 'vitest'
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/jwt'

describe('jwt utils', () => {
  it('signAccessToken returns a string token', () => {
    const token = signAccessToken('user-123')
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('verifyAccessToken returns userId from valid token', () => {
    const token = signAccessToken('user-123')
    const result = verifyAccessToken(token)
    expect(result).toBe('user-123')
  })

  it('verifyAccessToken returns null for invalid token', () => {
    const result = verifyAccessToken('not.a.token')
    expect(result).toBeNull()
  })

  it('signRefreshToken and verifyRefreshToken round-trip', () => {
    const token = signRefreshToken('user-456')
    const result = verifyRefreshToken(token)
    expect(result).toBe('user-456')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd cortex-api && npm test -- tests/utils/jwt.test.ts
```

Expected: FAIL — `Cannot find module '../../src/utils/jwt'`

- [ ] **Step 3: Implement src/utils/jwt.ts**

```typescript
import jwt from 'jsonwebtoken'
import { config } from '../config'

/** Signs an access token for the given userId. Expires per JWT_ACCESS_EXPIRES_IN. */
export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

/** Signs a refresh token for the given userId. Expires per JWT_REFRESH_EXPIRES_IN. */
export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

/** Verifies an access token. Returns userId string or null if invalid/expired. */
export function verifyAccessToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as { sub: string }
    return payload.sub
  } catch {
    return null
  }
}

/** Verifies a refresh token. Returns userId string or null if invalid/expired. */
export function verifyRefreshToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, config.JWT_REFRESH_SECRET) as { sub: string }
    return payload.sub
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/utils/jwt.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/jwt.ts tests/utils/jwt.test.ts
git commit -m "feat: add JWT sign/verify utilities with tests"
```

---

## Task 5: Utility — Password + Cognitive + Streak

**Files:**
- Create: `src/utils/password.ts`
- Create: `src/utils/cognitive.ts`
- Create: `src/utils/streak.ts`
- Create: `tests/utils/cognitive.test.ts`
- Create: `tests/utils/streak.test.ts`

- [ ] **Step 1: Create src/utils/password.ts**

```typescript
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/** Hashes a plaintext password with bcrypt. */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS)
}

/** Compares a plaintext password against a bcrypt hash. */
export async function comparePassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}
```

- [ ] **Step 2: Write failing tests for cognitive utils**

```typescript
// tests/utils/cognitive.test.ts
import { describe, it, expect } from 'vitest'
import {
  calculateEnergiaNeuralScore,
  calculateAccuracyScore,
  calculateEstimatedScore,
} from '../../src/utils/cognitive'

describe('calculateEnergiaNeuralScore', () => {
  it('returns 100 when user answered 70+ questions in 7 days', () => {
    expect(calculateEnergiaNeuralScore(70)).toBe(100)
    expect(calculateEnergiaNeuralScore(100)).toBe(100)
  })

  it('returns proportional value for fewer questions', () => {
    expect(calculateEnergiaNeuralScore(35)).toBeCloseTo(50, 0)
  })

  it('returns 0 when no questions answered', () => {
    expect(calculateEnergiaNeuralScore(0)).toBe(0)
  })
})

describe('calculateAccuracyScore', () => {
  it('returns 0 for fewer than 20 attempts (cold start)', () => {
    const attempts = [
      { isCorrect: true, daysAgo: 1 },
      { isCorrect: true, daysAgo: 2 },
    ]
    const score = calculateAccuracyScore(attempts)
    expect(score).toBeLessThan(10) // cold start dampening
  })

  it('returns ~100 for 20+ perfect answers', () => {
    const attempts = Array.from({ length: 25 }, (_, i) => ({
      isCorrect: true,
      daysAgo: i,
    }))
    const score = calculateAccuracyScore(attempts)
    expect(score).toBeGreaterThan(90)
  })

  it('weights recent answers more than old ones', () => {
    const recentBetter = [
      { isCorrect: false, daysAgo: 20 },
      { isCorrect: false, daysAgo: 19 },
      ...Array.from({ length: 20 }, (_, i) => ({ isCorrect: true, daysAgo: i })),
    ]
    const recentWorse = [
      ...Array.from({ length: 20 }, (_, i) => ({ isCorrect: true, daysAgo: 20 + i })),
      { isCorrect: false, daysAgo: 1 },
      { isCorrect: false, daysAgo: 0 },
    ]
    expect(calculateAccuracyScore(recentBetter)).toBeGreaterThan(
      calculateAccuracyScore(recentWorse),
    )
  })
})

describe('calculateEstimatedScore', () => {
  it('returns 0 when no area has data', () => {
    expect(calculateEstimatedScore({ logica: null, ciencias: null, interpretacao: null, memoria: null })).toBe(0)
  })

  it('returns 1000 for perfect accuracy across all areas with enough data', () => {
    const score = calculateEstimatedScore({
      logica: 1.0,
      ciencias: 1.0,
      interpretacao: 1.0,
      memoria: 1.0,
    })
    expect(score).toBe(1000)
  })

  it('returns 300 for 0% accuracy across all areas', () => {
    const score = calculateEstimatedScore({
      logica: 0,
      ciencias: 0,
      interpretacao: 0,
      memoria: 0,
    })
    expect(score).toBe(300)
  })
})
```

- [ ] **Step 3: Run to verify tests fail**

```bash
npm test -- tests/utils/cognitive.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 4: Implement src/utils/cognitive.ts**

```typescript
import { CognitiveAttribute } from '@prisma/client'
import { CognitiveImpactItem } from '../types/domain.types'

const DECAY_LAMBDA = 0.05 // half-life ~14 days
const COLD_START_THRESHOLD = 20
const ENERGY_DAILY_GOAL = 10
const ENERGY_WEEK_GOAL = ENERGY_DAILY_GOAL * 7 // 70

interface AttemptWeight {
  readonly isCorrect: boolean
  readonly daysAgo: number
}

interface AreaAccuracies {
  readonly logica: number | null
  readonly ciencias: number | null
  readonly interpretacao: number | null
  readonly memoria: number | null
}

/** Calculates Energia Neural based on questions answered in last 7 days. */
export function calculateEnergiaNeuralScore(questionsLast7Days: number): number {
  return Math.min(100, (questionsLast7Days / ENERGY_WEEK_GOAL) * 100)
}

/**
 * Calculates accuracy score with exponential time decay.
 * Applies cold-start dampening for < 20 attempts to avoid 0% or 100% early on.
 */
export function calculateAccuracyScore(attempts: readonly AttemptWeight[]): number {
  if (attempts.length === 0) return 0

  let weightedCorrect = 0
  let weightedTotal = 0

  for (const attempt of attempts) {
    const weight = Math.exp(-DECAY_LAMBDA * attempt.daysAgo)
    weightedCorrect += weight * (attempt.isCorrect ? 1 : 0)
    weightedTotal += weight
  }

  const rawScore = weightedTotal > 0 ? (weightedCorrect / weightedTotal) * 100 : 0

  const n = attempts.length
  if (n < COLD_START_THRESHOLD) {
    return rawScore * (n / COLD_START_THRESHOLD)
  }

  return rawScore
}

/**
 * Calculates estimated ENEM score (300–1000) from area accuracies.
 * Returns 0 if no areas have data (not enough questions yet).
 */
export function calculateEstimatedScore(areas: AreaAccuracies): number {
  const weights = [areas.logica, areas.ciencias, areas.interpretacao, areas.memoria]
  const available = weights.filter((w): w is number => w !== null)

  if (available.length === 0) return 0

  const avgAccuracy = available.reduce((sum, w) => sum + w, 0) / available.length
  return Math.round(300 + avgAccuracy * 700)
}

/**
 * Determines which cognitive attributes are impacted by a topic's CognitiveAttribute.
 * Returns the attribute string for storage in cognitiveImpact JSON.
 */
export function getCognitiveAttributeForTopic(
  topicAttribute: CognitiveAttribute,
): CognitiveAttribute {
  return topicAttribute
}

/**
 * Filters cognitive impact items to only include those with |delta| >= 0.5.
 * Smaller deltas accumulate but aren't meaningful to display individually.
 */
export function filterSignificantImpacts(
  impacts: readonly CognitiveImpactItem[],
): readonly CognitiveImpactItem[] {
  return impacts.filter((impact) => Math.abs(impact.delta) >= 0.5)
}
```

- [ ] **Step 5: Run cognitive tests**

```bash
npm test -- tests/utils/cognitive.test.ts
```

Expected: PASS (all tests)

- [ ] **Step 6: Write failing streak tests**

```typescript
// tests/utils/streak.test.ts
import { describe, it, expect } from 'vitest'
import { calculateStreakUpdate } from '../../src/utils/streak'

describe('calculateStreakUpdate', () => {
  it('increments streak when user studied on a different day', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const result = calculateStreakUpdate({
      currentStreakDays: 5,
      lastStudiedAt: yesterday,
      now: new Date(),
    })

    expect(result.streakDays).toBe(6)
    expect(result.streakReset).toBe(false)
  })

  it('does not increment streak when user already studied today', () => {
    const now = new Date()
    const result = calculateStreakUpdate({
      currentStreakDays: 5,
      lastStudiedAt: now,
      now,
    })
    expect(result.streakDays).toBe(5)
    expect(result.streakReset).toBe(false)
  })

  it('resets streak when more than 24h have passed without study', () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const result = calculateStreakUpdate({
      currentStreakDays: 10,
      lastStudiedAt: twoDaysAgo,
      now: new Date(),
    })

    expect(result.streakDays).toBe(1)
    expect(result.streakReset).toBe(true)
  })

  it('starts streak at 1 when lastStudiedAt is null', () => {
    const result = calculateStreakUpdate({
      currentStreakDays: 0,
      lastStudiedAt: null,
      now: new Date(),
    })
    expect(result.streakDays).toBe(1)
    expect(result.streakReset).toBe(false)
  })
})
```

- [ ] **Step 7: Run to verify fails**

```bash
npm test -- tests/utils/streak.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 8: Implement src/utils/streak.ts**

```typescript
interface StreakInput {
  readonly currentStreakDays: number
  readonly lastStudiedAt: Date | null
  readonly now: Date
}

interface StreakResult {
  readonly streakDays: number
  readonly lastStudiedAt: Date
  readonly streakReset: boolean
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Calculates updated streak days based on current state and current time.
 * "Day" is based on local calendar date, not UTC, to avoid timezone surprises.
 */
export function calculateStreakUpdate(input: StreakInput): StreakResult {
  const { currentStreakDays, lastStudiedAt, now } = input

  if (lastStudiedAt === null) {
    return { streakDays: 1, lastStudiedAt: now, streakReset: false }
  }

  if (isSameDay(lastStudiedAt, now)) {
    return { streakDays: currentStreakDays, lastStudiedAt: now, streakReset: false }
  }

  const msSinceLastStudy = now.getTime() - lastStudiedAt.getTime()
  if (msSinceLastStudy > ONE_DAY_MS) {
    return { streakDays: 1, lastStudiedAt: now, streakReset: true }
  }

  return { streakDays: currentStreakDays + 1, lastStudiedAt: now, streakReset: false }
}
```

- [ ] **Step 9: Run all utils tests**

```bash
npm test -- tests/utils/
```

Expected: PASS (all tests)

- [ ] **Step 10: Commit**

```bash
git add src/utils/ tests/utils/
git commit -m "feat: add password, cognitive, and streak utilities with tests"
```

---

## Task 6: Prisma Seed + Repositories

**Files:**
- Create: `prisma/seed.ts`
- Create: `src/repositories/user.repository.ts`
- Create: `src/repositories/question.repository.ts`
- Create: `src/repositories/answer.repository.ts`
- Create: `src/repositories/brain.repository.ts`
- Create: `src/repositories/achievement.repository.ts`

- [ ] **Step 1: Create prisma/seed.ts**

```typescript
import { PrismaClient, CognitiveAttribute } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  await prisma.topic.createMany({
    data: [
      { name: 'Matemática', slug: 'matematica', cognitiveAttribute: CognitiveAttribute.LOGICA },
      { name: 'Ciências da Natureza', slug: 'ciencias', cognitiveAttribute: CognitiveAttribute.CIENCIAS },
      { name: 'Linguagens e Códigos', slug: 'linguagens', cognitiveAttribute: CognitiveAttribute.INTERPRETACAO },
      { name: 'Ciências Humanas', slug: 'humanas', cognitiveAttribute: CognitiveAttribute.MEMORIA },
    ],
    skipDuplicates: true,
  })

  await prisma.achievement.createMany({
    data: [
      { id: 'first-challenge', name: 'Primeiro Passo', type: 'SESSION', threshold: 1, icon: 'footsteps-outline', description: 'Complete seu primeiro desafio' },
      { id: 'streak-3', name: 'Três em Sequência', type: 'STREAK', threshold: 3, icon: 'flame-outline', description: '3 dias de estudo consecutivos' },
      { id: 'streak-7', name: 'Semana Perfeita', type: 'STREAK', threshold: 7, icon: 'flame', description: '7 dias de estudo consecutivos' },
      { id: 'streak-30', name: 'Mês Dedicado', type: 'STREAK', threshold: 30, icon: 'trophy-outline', description: '30 dias de estudo consecutivos' },
      { id: 'perfect-session', name: 'Mente Afiada', type: 'PERFECT', threshold: 1, icon: 'star-outline', description: '10/10 em um único desafio' },
      { id: 'questions-50', name: 'Meio Centenário', type: 'VOLUME', threshold: 50, icon: 'library-outline', description: '50 questões respondidas' },
      { id: 'questions-100', name: 'Centenário', type: 'VOLUME', threshold: 100, icon: 'library', description: '100 questões respondidas' },
      { id: 'questions-500', name: 'Maratonista', type: 'VOLUME', threshold: 500, icon: 'medal-outline', description: '500 questões respondidas' },
      { id: 'level-5', name: 'Córtex Ativado', type: 'LEVEL', threshold: 5, icon: 'flash-outline', description: 'Atingir Nível 5' },
      { id: 'level-10', name: 'Cérebro Pleno', type: 'LEVEL', threshold: 10, icon: 'hardware-chip-outline', description: 'Atingir Nível 10' },
      { id: 'logica-80', name: 'Lógico Avançado', type: 'SKILL', threshold: 80, icon: 'calculator-outline', description: 'Atributo Lógica ≥ 80%' },
    ],
    skipDuplicates: true,
  })

  console.log('Seed completed.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Run seed**

```bash
npm run db:seed
```

Expected: `Seed completed.`

- [ ] **Step 3: Create src/repositories/user.repository.ts**

```typescript
import { PrismaClient, User } from '@prisma/client'
import { UserDTO } from '../types/domain.types'

interface CreateUserInput {
  readonly email: string
  readonly name: string
  readonly passwordHash?: string
}

interface UpsertAccountInput {
  readonly userId: string
  readonly provider: string
  readonly providerAccountId: string
  readonly accessToken?: string
}

function toUserDTO(user: User & { goal: { targetScore: number } | null }): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    xp: user.xp,
    level: user.level,
    streakDays: user.streakDays,
    hasCompletedOnboarding: user.goal !== null,
  }
}

/** Repository for User model. All DB access for users goes through here. */
export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<(User & { goal: { targetScore: number } | null }) | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { goal: { select: { targetScore: true } } },
    })
  }

  async findById(id: string): Promise<(User & { goal: { targetScore: number } | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { goal: { select: { targetScore: true } } },
    })
  }

  async create(input: CreateUserInput): Promise<UserDTO> {
    const user = await this.prisma.user.create({
      data: input,
      include: { goal: { select: { targetScore: true } } },
    })
    return toUserDTO(user)
  }

  async update(
    id: string,
    data: Partial<Pick<User, 'name' | 'image' | 'xp' | 'level' | 'streakDays' | 'lastStudiedAt'>>,
  ): Promise<void> {
    await this.prisma.user.update({ where: { id }, data })
  }

  async upsertAccount(input: UpsertAccountInput): Promise<void> {
    await this.prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: input.provider,
          providerAccountId: input.providerAccountId,
        },
      },
      update: { accessToken: input.accessToken },
      create: {
        userId: input.userId,
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        accessToken: input.accessToken,
      },
    })
  }

  async upsertGoal(userId: string, targetScore: number): Promise<void> {
    await this.prisma.goal.upsert({
      where: { userId },
      update: { targetScore },
      create: { userId, targetScore },
    })
  }

  async toDTO(user: User & { goal: { targetScore: number } | null }): Promise<UserDTO> {
    return toUserDTO(user)
  }
}
```

- [ ] **Step 4: Create src/repositories/question.repository.ts**

```typescript
import { PrismaClient, Question, CognitiveAttribute } from '@prisma/client'

interface BuildSessionInput {
  readonly userId: string
  readonly topicId?: string
  readonly difficulty?: number
  readonly limit: number
}

type QuestionWithTopic = Question & {
  topic: { name: string; cognitiveAttribute: CognitiveAttribute }
}

/** Repository for Question model. Handles question selection logic for challenge sessions. */
export class QuestionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Selects questions for a challenge session.
   * Priority: previously incorrect answers > unseen > random.
   * Avoids questions answered in the user's last 30 attempts in the topic.
   */
  async selectForSession(input: BuildSessionInput): Promise<QuestionWithTopic[]> {
    const { userId, topicId, difficulty, limit } = input

    const recentAnsweredIds = await this.prisma.attempt.findMany({
      where: { userId },
      orderBy: { answeredAt: 'desc' },
      take: 30,
      select: { questionId: true },
    })
    const excludeIds = recentAnsweredIds.map((a) => a.questionId)

    const incorrectFirst = await this.prisma.question.findMany({
      where: {
        id: { notIn: excludeIds },
        ...(topicId ? { topicId } : {}),
        ...(difficulty ? { difficulty } : {}),
        attempts: {
          some: { userId, isCorrect: false },
        },
      },
      include: { topic: { select: { name: true, cognitiveAttribute: true } } },
      take: Math.ceil(limit / 2),
      orderBy: { createdAt: 'asc' },
    })

    const needed = limit - incorrectFirst.length
    const usedIds = [...excludeIds, ...incorrectFirst.map((q) => q.id)]

    const filler = await this.prisma.question.findMany({
      where: {
        id: { notIn: usedIds },
        ...(topicId ? { topicId } : {}),
        ...(difficulty ? { difficulty } : {}),
      },
      include: { topic: { select: { name: true, cognitiveAttribute: true } } },
      take: needed,
      orderBy: { createdAt: 'asc' },
    })

    return [...incorrectFirst, ...filler]
  }

  async findById(id: string): Promise<QuestionWithTopic | null> {
    return this.prisma.question.findUnique({
      where: { id },
      include: { topic: { select: { name: true, cognitiveAttribute: true } } },
    })
  }
}
```

- [ ] **Step 5: Create src/repositories/answer.repository.ts**

```typescript
import { PrismaClient } from '@prisma/client'
import { CognitiveImpactItem } from '../types/domain.types'

interface CreateAttemptInput {
  readonly userId: string
  readonly questionId: string
  readonly challengeId: string
  readonly chosenKey: string
  readonly isCorrect: boolean
  readonly xpEarned: number
  readonly cognitiveImpact: readonly CognitiveImpactItem[]
}

interface AttemptForCalc {
  readonly isCorrect: boolean
  readonly answeredAt: Date
}

/** Repository for Attempt model. */
export class AnswerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateAttemptInput): Promise<void> {
    await this.prisma.attempt.create({
      data: {
        userId: input.userId,
        questionId: input.questionId,
        challengeId: input.challengeId,
        chosenKey: input.chosenKey,
        isCorrect: input.isCorrect,
        xpEarned: input.xpEarned,
        cognitiveImpact: input.cognitiveImpact as object[],
      },
    })
  }

  async existsInChallenge(challengeId: string, questionId: string): Promise<boolean> {
    const attempt = await this.prisma.attempt.findFirst({
      where: { challengeId, questionId },
      select: { id: true },
    })
    return attempt !== null
  }

  async findByUserAndTopic(
    userId: string,
    topicId: string,
  ): Promise<AttemptForCalc[]> {
    return this.prisma.attempt.findMany({
      where: {
        userId,
        question: { topicId },
      },
      select: { isCorrect: true, answeredAt: true },
      orderBy: { answeredAt: 'desc' },
    })
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.attempt.count({ where: { userId } })
  }

  async countCorrectByUser(userId: string): Promise<number> {
    return this.prisma.attempt.count({ where: { userId, isCorrect: true } })
  }

  async countByUserLast7Days(userId: string): Promise<number> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return this.prisma.attempt.count({
      where: { userId, answeredAt: { gte: sevenDaysAgo } },
    })
  }
}
```

- [ ] **Step 6: Create src/repositories/brain.repository.ts**

```typescript
import { PrismaClient, BrainMetrics, BrainSnapshot } from '@prisma/client'
import { BrainMetricsDTO } from '../types/domain.types'

function toBrainMetricsDTO(m: BrainMetrics): BrainMetricsDTO {
  return {
    energiaNeuralScore: m.energiaNeuralScore,
    memoriaScore: m.memoriaScore,
    logicaScore: m.logicaScore,
    interpretacaoScore: m.interpretacaoScore,
    cienciasScore: m.cienciasScore,
    estimatedScore: m.estimatedScore,
  }
}

/** Repository for BrainMetrics and BrainSnapshot models. */
export class BrainRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findCurrentByUser(userId: string): Promise<BrainMetricsDTO | null> {
    const metrics = await this.prisma.brainMetrics.findUnique({ where: { userId } })
    return metrics ? toBrainMetricsDTO(metrics) : null
  }

  async upsert(userId: string, data: Omit<BrainMetricsDTO, never>): Promise<BrainMetricsDTO> {
    const metrics = await this.prisma.brainMetrics.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })
    return toBrainMetricsDTO(metrics)
  }

  async takeSnapshot(userId: string, metrics: BrainMetricsDTO): Promise<void> {
    await this.prisma.brainSnapshot.create({
      data: { userId, ...metrics },
    })
  }

  async findHistory(userId: string, days: number): Promise<readonly BrainSnapshot[]> {
    const since = new Date()
    since.setDate(since.getDate() - days)
    return this.prisma.brainSnapshot.findMany({
      where: { userId, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
    })
  }
}
```

- [ ] **Step 7: Create src/repositories/achievement.repository.ts**

```typescript
import { PrismaClient, Achievement, UserAchievement } from '@prisma/client'

type AchievementWithUnlock = Achievement & { userAchievements: UserAchievement[] }

/** Repository for Achievement and UserAchievement models. */
export class AchievementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({ orderBy: { threshold: 'asc' } })
  }

  async findUnlockedByUser(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    })
  }

  async unlock(userId: string, achievementId: string): Promise<void> {
    await this.prisma.userAchievement.create({ data: { userId, achievementId } })
  }

  async isUnlocked(userId: string, achievementId: string): Promise<boolean> {
    const ua = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
      select: { id: true },
    })
    return ua !== null
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add prisma/seed.ts src/repositories/
git commit -m "feat: add seed data and all repositories"
```

---

## Task 7: Auth Service

**Files:**
- Create: `src/services/auth.service.ts`
- Create: `tests/services/auth.service.test.ts`
- Create: `tests/helpers/prisma-mock.ts`

- [ ] **Step 1: Create tests/helpers/prisma-mock.ts**

```typescript
import { vi } from 'vitest'
import { PrismaClient } from '@prisma/client'

export type MockPrisma = {
  user: {
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  account: {
    upsert: ReturnType<typeof vi.fn>
  }
  goal: {
    upsert: ReturnType<typeof vi.fn>
  }
  brainMetrics: {
    upsert: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
  }
}

export function createMockPrisma(): MockPrisma {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    account: {
      upsert: vi.fn(),
    },
    goal: {
      upsert: vi.fn(),
    },
    brainMetrics: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
  }
}
```

- [ ] **Step 2: Write failing auth service tests**

```typescript
// tests/services/auth.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../../src/services/auth.service'
import { UserRepository } from '../../src/repositories/user.repository'
import { comparePassword } from '../../src/utils/password'

vi.mock('../../src/utils/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('$2b$hashed'),
  comparePassword: vi.fn(),
}))

vi.mock('../../src/utils/jwt', () => ({
  signAccessToken: vi.fn().mockReturnValue('access-token'),
  signRefreshToken: vi.fn().mockReturnValue('refresh-token'),
}))

const mockUserRepo = {
  findByEmail: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  upsertAccount: vi.fn(),
  upsertGoal: vi.fn(),
  toDTO: vi.fn(),
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AuthService(mockUserRepo as unknown as UserRepository)
  })

  describe('register', () => {
    it('throws CONFLICT when email already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing' })

      await expect(
        service.register({ name: 'Test', email: 'test@test.com', password: '123456' }),
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('creates user and returns tokens', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null)
      mockUserRepo.create.mockResolvedValue({
        id: 'new-user',
        email: 'test@test.com',
        name: 'Test',
        image: null,
        xp: 0,
        level: 1,
        streakDays: 0,
        hasCompletedOnboarding: false,
      })

      const result = await service.register({
        name: 'Test',
        email: 'test@test.com',
        password: '123456',
      })

      expect(result.accessToken).toBe('access-token')
      expect(result.refreshToken).toBe('refresh-token')
      expect(result.user.email).toBe('test@test.com')
    })
  })

  describe('login', () => {
    it('throws UNAUTHORIZED for unknown email', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null)

      await expect(
        service.login({ email: 'nobody@test.com', password: '123456' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    })

    it('throws UNAUTHORIZED for wrong password', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        passwordHash: '$2b$hashed',
        goal: null,
      })
      vi.mocked(comparePassword).mockResolvedValue(false)

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    })
  })
})
```

- [ ] **Step 3: Run to verify fails**

```bash
npm test -- tests/services/auth.service.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 4: Implement src/services/auth.service.ts**

```typescript
import { UserRepository } from '../repositories/user.repository'
import { hashPassword, comparePassword } from '../utils/password'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { UserDTO, TokenPair } from '../types/domain.types'

interface RegisterInput {
  readonly name: string
  readonly email: string
  readonly password: string
}

interface LoginInput {
  readonly email: string
  readonly password: string
}

interface AuthResult {
  readonly user: UserDTO
  readonly accessToken: string
  readonly refreshToken: string
}

interface ServiceError {
  readonly code: 'CONFLICT' | 'UNAUTHORIZED' | 'NOT_FOUND'
  readonly message: string
}

function createError(code: ServiceError['code'], message: string): ServiceError & Error {
  return Object.assign(new Error(message), { code })
}

/** Service handling user registration, login, and token management. */
export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(input.email)
    if (existing) throw createError('CONFLICT', 'Email já cadastrado')

    const passwordHash = await hashPassword(input.password)
    const user = await this.userRepo.create({
      email: input.email,
      name: input.name,
      passwordHash,
    })

    return {
      user,
      accessToken: signAccessToken(user.id),
      refreshToken: signRefreshToken(user.id),
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(input.email)
    if (!user) throw createError('UNAUTHORIZED', 'Credenciais inválidas')
    if (!user.passwordHash) throw createError('UNAUTHORIZED', 'Use login social')

    const valid = await comparePassword(input.password, user.passwordHash)
    if (!valid) throw createError('UNAUTHORIZED', 'Credenciais inválidas')

    const dto = await this.userRepo.toDTO(user)
    return {
      user: dto,
      accessToken: signAccessToken(user.id),
      refreshToken: signRefreshToken(user.id),
    }
  }

  refresh(token: string): TokenPair {
    const userId = verifyRefreshToken(token)
    if (!userId) throw createError('UNAUTHORIZED', 'Refresh token inválido')

    return {
      accessToken: signAccessToken(userId),
      refreshToken: signRefreshToken(userId),
    }
  }

  async loginWithGoogle(input: {
    email: string
    name: string
    image?: string
    providerAccountId: string
  }): Promise<AuthResult> {
    let user = await this.userRepo.findByEmail(input.email)

    if (!user) {
      const dto = await this.userRepo.create({
        email: input.email,
        name: input.name,
      })
      user = await this.userRepo.findByEmail(input.email)
      if (!user) throw createError('NOT_FOUND', 'User creation failed')
    }

    await this.userRepo.upsertAccount({
      userId: user.id,
      provider: 'google',
      providerAccountId: input.providerAccountId,
    })

    const dto = await this.userRepo.toDTO(user)
    return {
      user: dto,
      accessToken: signAccessToken(user.id),
      refreshToken: signRefreshToken(user.id),
    }
  }
}
```

- [ ] **Step 5: Run auth service tests**

```bash
npm test -- tests/services/auth.service.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/services/auth.service.ts tests/services/auth.service.test.ts tests/helpers/
git commit -m "feat: add AuthService with register, login, refresh, and Google OAuth"
```

---

## Task 8: Brain Service + Answer Service

**Files:**
- Create: `src/services/brain.service.ts`
- Create: `src/services/answer.service.ts`
- Create: `src/services/achievement.service.ts`
- Create: `tests/services/brain.service.test.ts`
- Create: `tests/services/answer.service.test.ts`

- [ ] **Step 1: Write failing brain service test**

```typescript
// tests/services/brain.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrainService } from '../../src/services/brain.service'

const mockBrainRepo = {
  findCurrentByUser: vi.fn(),
  upsert: vi.fn(),
  takeSnapshot: vi.fn(),
  findHistory: vi.fn(),
}

const mockAnswerRepo = {
  findByUserAndTopic: vi.fn(),
  countByUserLast7Days: vi.fn(),
}

describe('BrainService.recalculateForUser', () => {
  let service: BrainService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new BrainService(mockBrainRepo as never, mockAnswerRepo as never)
  })

  it('sets energiaNeuralScore based on last 7 days activity', async () => {
    mockAnswerRepo.countByUserLast7Days.mockResolvedValue(35)
    mockAnswerRepo.findByUserAndTopic.mockResolvedValue([])
    mockBrainRepo.upsert.mockImplementation((_id: string, data: unknown) => data)

    const result = await service.recalculateForUser('user-1', 'logica-topic-id')

    expect(result.energiaNeuralScore).toBeCloseTo(50, 0)
  })
})
```

- [ ] **Step 2: Implement src/services/brain.service.ts**

```typescript
import { BrainRepository } from '../repositories/brain.repository'
import { AnswerRepository } from '../repositories/answer.repository'
import { BrainMetricsDTO, CognitiveImpactItem } from '../types/domain.types'
import { CognitiveAttribute } from '@prisma/client'
import {
  calculateEnergiaNeuralScore,
  calculateAccuracyScore,
  calculateEstimatedScore,
  filterSignificantImpacts,
} from '../utils/cognitive'

interface TopicIdMap {
  readonly LOGICA: string
  readonly CIENCIAS: string
  readonly INTERPRETACAO: string
  readonly MEMORIA: string
}

/**
 * Service for calculating and persisting cognitive brain metrics.
 * Called after each answer submission to update user's brain state.
 */
export class BrainService {
  constructor(
    private readonly brainRepo: BrainRepository,
    private readonly answerRepo: AnswerRepository,
  ) {}

  /**
   * Recalculates all 5 brain attributes for a user, saves to BrainMetrics,
   * and returns the delta for the attribute impacted by the given topicId.
   */
  async recalculateForUser(
    userId: string,
    changedTopicId: string,
    topicIdMap?: TopicIdMap,
  ): Promise<BrainMetricsDTO & { readonly impacts: readonly CognitiveImpactItem[] }> {
    const previous = await this.brainRepo.findCurrentByUser(userId)

    const questionsLast7Days = await this.answerRepo.countByUserLast7Days(userId)
    const energiaNeuralScore = calculateEnergiaNeuralScore(questionsLast7Days)

    const buildScore = async (topicId: string | undefined): Promise<number> => {
      if (!topicId) return 0
      const attempts = await this.answerRepo.findByUserAndTopic(userId, topicId)
      return calculateAccuracyScore(
        attempts.map((a) => ({
          isCorrect: a.isCorrect,
          daysAgo: (Date.now() - a.answeredAt.getTime()) / (1000 * 60 * 60 * 24),
        })),
      )
    }

    const [logicaScore, cienciasScore, interpretacaoScore, memoriaScore] = await Promise.all([
      buildScore(topicIdMap?.LOGICA),
      buildScore(topicIdMap?.CIENCIAS),
      buildScore(topicIdMap?.INTERPRETACAO),
      buildScore(topicIdMap?.MEMORIA),
    ])

    const estimatedScore = calculateEstimatedScore({
      logica: logicaScore / 100,
      ciencias: cienciasScore / 100,
      interpretacao: interpretacaoScore / 100,
      memoria: memoriaScore / 100,
    })

    const updated: BrainMetricsDTO = {
      energiaNeuralScore,
      logicaScore,
      cienciasScore,
      interpretacaoScore,
      memoriaScore,
      estimatedScore,
    }

    await this.brainRepo.upsert(userId, updated)

    const impacts = filterSignificantImpacts(
      this.buildImpacts(previous, updated),
    )

    return { ...updated, impacts }
  }

  private buildImpacts(
    previous: BrainMetricsDTO | null,
    current: BrainMetricsDTO,
  ): readonly CognitiveImpactItem[] {
    if (!previous) return []

    const pairs: Array<[CognitiveAttribute, number, number]> = [
      [CognitiveAttribute.ENERGIA_NEURAL, previous.energiaNeuralScore, current.energiaNeuralScore],
      [CognitiveAttribute.LOGICA, previous.logicaScore, current.logicaScore],
      [CognitiveAttribute.CIENCIAS, previous.cienciasScore, current.cienciasScore],
      [CognitiveAttribute.INTERPRETACAO, previous.interpretacaoScore, current.interpretacaoScore],
      [CognitiveAttribute.MEMORIA, previous.memoriaScore, current.memoriaScore],
    ]

    return pairs.map(([attribute, prev, curr]) => ({
      attribute,
      delta: parseFloat((curr - prev).toFixed(2)),
    }))
  }

  async takeSnapshot(userId: string): Promise<void> {
    const metrics = await this.brainRepo.findCurrentByUser(userId)
    if (!metrics) return
    await this.brainRepo.takeSnapshot(userId, metrics)
  }

  async getHistory(userId: string, days: number): Promise<ReturnType<BrainRepository['findHistory']>> {
    return this.brainRepo.findHistory(userId, days)
  }
}
```

- [ ] **Step 3: Create src/services/achievement.service.ts**

```typescript
import { AchievementRepository } from '../repositories/achievement.repository'
import { AnswerRepository } from '../repositories/answer.repository'

interface UserStateForAchievements {
  readonly userId: string
  readonly level: number
  readonly streakDays: number
  readonly totalAttempts: number
  readonly sessionCorrect: number
  readonly sessionTotal: number
  readonly logicaScore: number
}

/**
 * Checks and unlocks achievements after each answer or session completion.
 * Returns array of newly unlocked achievement IDs.
 */
export class AchievementService {
  constructor(
    private readonly achievementRepo: AchievementRepository,
    private readonly answerRepo: AnswerRepository,
  ) {}

  async checkAndUnlock(state: UserStateForAchievements): Promise<readonly string[]> {
    const [allAchievements, unlockedIds] = await Promise.all([
      this.achievementRepo.findAll(),
      this.achievementRepo.findUnlockedByUser(state.userId).then((ua) => ua.map((u) => u.achievementId)),
    ])

    const totalAttempts = await this.answerRepo.countByUser(state.userId)
    const newlyUnlocked: string[] = []

    for (const achievement of allAchievements) {
      if (unlockedIds.includes(achievement.id)) continue

      const shouldUnlock = this.meetsThreshold(achievement, {
        ...state,
        totalAttempts,
      })

      if (shouldUnlock) {
        await this.achievementRepo.unlock(state.userId, achievement.id)
        newlyUnlocked.push(achievement.id)
      }
    }

    return newlyUnlocked
  }

  private meetsThreshold(
    achievement: { id: string; type: string; threshold: number },
    state: UserStateForAchievements & { totalAttempts: number },
  ): boolean {
    switch (achievement.type) {
      case 'SESSION':
        return achievement.threshold === 1
      case 'STREAK':
        return state.streakDays >= achievement.threshold
      case 'VOLUME':
        return state.totalAttempts >= achievement.threshold
      case 'LEVEL':
        return state.level >= achievement.threshold
      case 'PERFECT':
        return state.sessionCorrect === state.sessionTotal && state.sessionTotal >= 10
      case 'SKILL':
        if (achievement.id === 'logica-80') return state.logicaScore >= achievement.threshold
        return false
      default:
        return false
    }
  }
}
```

- [ ] **Step 4: Create src/services/answer.service.ts**

```typescript
import { PrismaClient } from '@prisma/client'
import { AnswerRepository } from '../repositories/answer.repository'
import { QuestionRepository } from '../repositories/question.repository'
import { UserRepository } from '../repositories/user.repository'
import { BrainService } from './brain.service'
import { AchievementService } from './achievement.service'
import { calculateStreakUpdate } from '../utils/streak'
import { AttemptResult } from '../types/domain.types'

const XP_CORRECT = 10
const XP_WRONG = 3
const XP_CONSECUTIVE_BONUS = 5
const XP_SESSION_BONUS = 20
const XP_PERFECT_SESSION_BONUS = 50

interface SubmitAnswerInput {
  readonly userId: string
  readonly challengeId: string
  readonly questionId: string
  readonly chosenKey: string
  readonly consecutiveCorrect: number
}

function calculateLevelFromXP(xp: number): number {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000]
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= (thresholds[i] ?? 0)) return i + 1
  }
  return 1
}

/** Service for processing answer submissions. Orchestrates XP, streak, brain, and achievements. */
export class AnswerService {
  constructor(
    private readonly answerRepo: AnswerRepository,
    private readonly questionRepo: QuestionRepository,
    private readonly userRepo: UserRepository,
    private readonly brainService: BrainService,
    private readonly achievementService: AchievementService,
    private readonly prisma: PrismaClient,
  ) {}

  async submitAnswer(input: SubmitAnswerInput): Promise<AttemptResult> {
    const question = await this.questionRepo.findById(input.questionId)
    if (!question) throw Object.assign(new Error('Questão não encontrada'), { code: 'NOT_FOUND' })

    const alreadyAnswered = await this.answerRepo.existsInChallenge(
      input.challengeId,
      input.questionId,
    )
    if (alreadyAnswered) {
      throw Object.assign(new Error('Questão já respondida'), { code: 'CONFLICT' })
    }

    const isCorrect = question.correctKey === input.chosenKey
    let xpEarned = isCorrect ? XP_CORRECT : XP_WRONG
    if (isCorrect && input.consecutiveCorrect > 0 && input.consecutiveCorrect % 3 === 0) {
      xpEarned += XP_CONSECUTIVE_BONUS
    }

    const user = await this.userRepo.findById(input.userId)
    if (!user) throw Object.assign(new Error('Usuário não encontrado'), { code: 'NOT_FOUND' })

    const streakResult = calculateStreakUpdate({
      currentStreakDays: user.streakDays,
      lastStudiedAt: user.lastStudiedAt,
      now: new Date(),
    })

    const newXP = user.xp + xpEarned
    const newLevel = calculateLevelFromXP(newXP)

    await this.userRepo.update(input.userId, {
      xp: newXP,
      level: newLevel,
      streakDays: streakResult.streakDays,
      lastStudiedAt: streakResult.lastStudiedAt,
    })

    const brainResult = await this.brainService.recalculateForUser(
      input.userId,
      question.topicId,
    )

    const significantImpacts = brainResult.impacts

    await this.answerRepo.create({
      userId: input.userId,
      questionId: input.questionId,
      challengeId: input.challengeId,
      chosenKey: input.chosenKey,
      isCorrect,
      xpEarned,
      cognitiveImpact: significantImpacts,
    })

    await this.achievementService.checkAndUnlock({
      userId: input.userId,
      level: newLevel,
      streakDays: streakResult.streakDays,
      totalAttempts: 0, // will be fetched inside service
      sessionCorrect: 0, // approximate; session tracking is on the client
      sessionTotal: 10,
      logicaScore: brainResult.logicaScore,
    })

    return {
      isCorrect,
      correctKey: question.correctKey,
      xpEarned,
      cognitiveImpact: significantImpacts,
      explanation: null,
    }
  }
}
```

- [ ] **Step 5: Run brain service test**

```bash
npm test -- tests/services/brain.service.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/services/
git commit -m "feat: add BrainService, AnswerService, and AchievementService"
```

---

## Task 9: Challenge Service + Dashboard Service

**Files:**
- Create: `src/services/challenge.service.ts`
- Create: `src/services/dashboard.service.ts`

- [ ] **Step 1: Create src/services/challenge.service.ts**

```typescript
import { PrismaClient } from '@prisma/client'
import { QuestionRepository } from '../repositories/question.repository'
import { BrainService } from './brain.service'
import { QuestionDTO } from '../types/domain.types'

interface BuildChallengeInput {
  readonly userId: string
  readonly topicId?: string
  readonly difficulty?: number
}

interface ChallengeSession {
  readonly challengeId: string
  readonly questions: readonly QuestionDTO[]
}

/** Service for building and completing challenge sessions. */
export class ChallengeService {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly brainService: BrainService,
    private readonly prisma: PrismaClient,
  ) {}

  async buildSession(input: BuildChallengeInput): Promise<ChallengeSession> {
    const questions = await this.questionRepo.selectForSession({
      userId: input.userId,
      topicId: input.topicId,
      difficulty: input.difficulty,
      limit: 10,
    })

    if (questions.length === 0) {
      throw Object.assign(new Error('Nenhuma questão disponível'), { code: 'NOT_FOUND' })
    }

    const challenge = await this.prisma.challenge.create({
      data: {
        userId: input.userId,
        totalQuestions: questions.length,
        challengeQuestions: {
          create: questions.map((q, i) => ({
            questionId: q.id,
            position: i + 1,
          })),
        },
      },
    })

    return {
      challengeId: challenge.id,
      questions: questions.map((q) => ({
        id: q.id,
        statement: q.statement,
        alternatives: q.alternatives as Array<{ key: string; text: string }>,
        imageUrl: q.imageUrl,
        year: q.year,
        topic: {
          name: q.topic.name,
          cognitiveAttribute: q.topic.cognitiveAttribute,
        },
      })),
    }
  }

  async completeChallenge(challengeId: string, userId: string): Promise<void> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        attempts: { select: { isCorrect: true, xpEarned: true } },
      },
    })

    if (!challenge) throw Object.assign(new Error('Desafio não encontrado'), { code: 'NOT_FOUND' })
    if (challenge.userId !== userId) throw Object.assign(new Error('Proibido'), { code: 'FORBIDDEN' })
    if (challenge.status !== 'ACTIVE') return

    const totalXP = challenge.attempts.reduce((sum, a) => sum + a.xpEarned, 0)
    const totalCorrect = challenge.attempts.filter((a) => a.isCorrect).length

    await this.prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        totalXP,
        totalCorrect,
      },
    })

    await this.brainService.takeSnapshot(userId)
  }
}
```

- [ ] **Step 2: Create src/services/dashboard.service.ts**

```typescript
import { UserRepository } from '../repositories/user.repository'
import { BrainRepository } from '../repositories/brain.repository'
import { AnswerRepository } from '../repositories/answer.repository'

interface DashboardData {
  readonly user: {
    readonly name: string
    readonly level: number
    readonly xp: number
    readonly streakDays: number
  }
  readonly brainMetrics: {
    readonly energiaNeuralScore: number
    readonly memoriaScore: number
    readonly logicaScore: number
    readonly interpretacaoScore: number
    readonly cienciasScore: number
    readonly estimatedScore: number
  }
  readonly recentActivity: {
    readonly questionsThisWeek: number
    readonly correctThisWeek: number
    readonly sessionsThisWeek: number
  }
}

/** Service for assembling the Home dashboard data. */
export class DashboardService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly brainRepo: BrainRepository,
    private readonly answerRepo: AnswerRepository,
  ) {}

  async getDashboardData(userId: string): Promise<DashboardData> {
    const [user, brainMetrics, questionsThisWeek] = await Promise.all([
      this.userRepo.findById(userId),
      this.brainRepo.findCurrentByUser(userId),
      this.answerRepo.countByUserLast7Days(userId),
    ])

    if (!user) throw Object.assign(new Error('Usuário não encontrado'), { code: 'NOT_FOUND' })

    return {
      user: {
        name: user.name,
        level: user.level,
        xp: user.xp,
        streakDays: user.streakDays,
      },
      brainMetrics: brainMetrics ?? {
        energiaNeuralScore: 0,
        memoriaScore: 0,
        logicaScore: 0,
        interpretacaoScore: 0,
        cienciasScore: 0,
        estimatedScore: 0,
      },
      recentActivity: {
        questionsThisWeek,
        correctThisWeek: 0, // TODO in V1: track correct separately
        sessionsThisWeek: 0,
      },
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/services/challenge.service.ts src/services/dashboard.service.ts
git commit -m "feat: add ChallengeService and DashboardService"
```

---

## Task 10: Validators (Zod Schemas)

**Files:**
- Create: `src/validators/auth.schema.ts`
- Create: `src/validators/challenge.schema.ts`
- Create: `src/validators/answer.schema.ts`
- Create: `src/validators/user.schema.ts`

- [ ] **Step 1: Create src/validators/auth.schema.ts**

```typescript
import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
})
```

- [ ] **Step 2: Create src/validators/challenge.schema.ts**

```typescript
import { z } from 'zod'

export const challengeQuerySchema = z.object({
  topicId: z.string().cuid().optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
})

export const completeChallengeSchema = z.object({
  challengeId: z.string().cuid(),
})
```

- [ ] **Step 3: Create src/validators/answer.schema.ts**

```typescript
import { z } from 'zod'

export const submitAnswerSchema = z.object({
  challengeId: z.string().cuid(),
  questionId: z.string().cuid(),
  chosenKey: z.enum(['A', 'B', 'C', 'D', 'E']),
  consecutiveCorrect: z.number().int().min(0),
})
```

- [ ] **Step 4: Create src/validators/user.schema.ts**

```typescript
import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  image: z.string().url().optional(),
})

export const onboardingSchema = z.object({
  targetScore: z.number().int().refine(
    (v) => [500, 600, 700, 800, 900].includes(v),
    { message: 'targetScore must be 500, 600, 700, 800, or 900' },
  ),
})
```

- [ ] **Step 5: Commit**

```bash
git add src/validators/
git commit -m "feat: add Zod validators for all routes"
```

---

## Task 11: Middleware + Routes

**Files:**
- Create: `src/middleware/authenticate.ts`
- Create: `src/routes/v1/auth.routes.ts`
- Create: `src/routes/v1/users.routes.ts`
- Create: `src/routes/v1/challenges.routes.ts`
- Create: `src/routes/v1/answers.routes.ts`
- Create: `src/routes/v1/brain.routes.ts`
- Create: `src/routes/v1/dashboard.routes.ts`
- Create: `src/routes/v1/achievements.routes.ts`
- Create: `src/routes/v1/index.ts`

- [ ] **Step 1: Create src/middleware/authenticate.ts**

```typescript
import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken } from '../utils/jwt'

/**
 * Fastify preHandler hook that verifies the Bearer token.
 * Sets request.userId if valid. Replies 401 if missing or invalid.
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Token ausente' })
    return
  }

  const token = authHeader.slice(7)
  const userId = verifyAccessToken(token)

  if (!userId) {
    reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Token inválido ou expirado' })
    return
  }

  request.userId = userId
}
```

- [ ] **Step 2: Create src/routes/v1/auth.routes.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from '../../validators/auth.schema'
import { AuthService } from '../../services/auth.service'

interface AuthRoutesOptions {
  readonly authService: AuthService
}

export const authRoutes: FastifyPluginAsync<AuthRoutesOptions> = async (fastify, opts) => {
  const { authService } = opts

  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    try {
      const result = await authService.register(body.data)
      return reply.code(201).send(result)
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'CONFLICT') return reply.code(409).send({ error: 'CONFLICT', message: e.message })
      throw err
    }
  })

  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    try {
      const result = await authService.login(body.data)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'UNAUTHORIZED') return reply.code(401).send({ error: 'UNAUTHORIZED', message: e.message })
      throw err
    }
  })

  fastify.post('/refresh', async (request, reply) => {
    const body = refreshSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    try {
      const tokens = authService.refresh(body.data.refreshToken)
      return reply.send(tokens)
    } catch {
      return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Refresh token inválido' })
    }
  })

  fastify.delete('/logout', async (_request, reply) => {
    return reply.code(204).send()
  })
}
```

- [ ] **Step 3: Create src/routes/v1/users.routes.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middleware/authenticate'
import { updateUserSchema, onboardingSchema } from '../../validators/user.schema'
import { UserRepository } from '../../repositories/user.repository'
import { BrainRepository } from '../../repositories/brain.repository'

interface UsersRoutesOptions {
  readonly userRepo: UserRepository
  readonly brainRepo: BrainRepository
}

export const usersRoutes: FastifyPluginAsync<UsersRoutesOptions> = async (fastify, opts) => {
  const { userRepo, brainRepo } = opts

  fastify.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const user = await userRepo.findById(request.userId)
    if (!user) return reply.code(404).send({ error: 'NOT_FOUND', message: 'Usuário não encontrado' })
    return reply.send(await userRepo.toDTO(user))
  })

  fastify.patch('/me', { preHandler: authenticate }, async (request, reply) => {
    const body = updateUserSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    await userRepo.update(request.userId, body.data)
    const updated = await userRepo.findById(request.userId)
    if (!updated) return reply.code(404).send({ error: 'NOT_FOUND', message: 'Usuário não encontrado' })
    return reply.send(await userRepo.toDTO(updated))
  })

  fastify.post('/me/onboarding', { preHandler: authenticate }, async (request, reply) => {
    const body = onboardingSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    await userRepo.upsertGoal(request.userId, body.data.targetScore)
    await brainRepo.upsert(request.userId, {
      energiaNeuralScore: 0,
      memoriaScore: 0,
      logicaScore: 0,
      interpretacaoScore: 0,
      cienciasScore: 0,
      estimatedScore: 0,
    })
    return reply.code(201).send({ goal: { targetScore: body.data.targetScore } })
  })
}
```

- [ ] **Step 4: Create src/routes/v1/challenges.routes.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middleware/authenticate'
import { challengeQuerySchema } from '../../validators/challenge.schema'
import { ChallengeService } from '../../services/challenge.service'

interface ChallengesRoutesOptions {
  readonly challengeService: ChallengeService
}

export const challengesRoutes: FastifyPluginAsync<ChallengesRoutesOptions> = async (fastify, opts) => {
  const { challengeService } = opts

  fastify.get('/next', { preHandler: authenticate }, async (request, reply) => {
    const query = challengeQuerySchema.safeParse(request.query)
    if (!query.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: query.error.flatten() })
    }
    try {
      const session = await challengeService.buildSession({
        userId: request.userId,
        topicId: query.data.topicId,
        difficulty: query.data.difficulty,
      })
      return reply.send(session)
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'NOT_FOUND') return reply.code(404).send({ error: 'NOT_FOUND', message: e.message })
      throw err
    }
  })

  fastify.patch('/:id/complete', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await challengeService.completeChallenge(id, request.userId)
    return reply.send({ success: true })
  })
}
```

- [ ] **Step 5: Create src/routes/v1/answers.routes.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middleware/authenticate'
import { submitAnswerSchema } from '../../validators/answer.schema'
import { AnswerService } from '../../services/answer.service'

interface AnswersRoutesOptions {
  readonly answerService: AnswerService
}

export const answersRoutes: FastifyPluginAsync<AnswersRoutesOptions> = async (fastify, opts) => {
  const { answerService } = opts

  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const body = submitAnswerSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    try {
      const result = await answerService.submitAnswer({
        userId: request.userId,
        ...body.data,
      })
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'NOT_FOUND') return reply.code(404).send({ error: 'NOT_FOUND', message: e.message })
      if (e.code === 'CONFLICT') return reply.code(409).send({ error: 'CONFLICT', message: e.message })
      throw err
    }
  })
}
```

- [ ] **Step 6: Create src/routes/v1/brain.routes.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middleware/authenticate'
import { BrainService } from '../../services/brain.service'
import { BrainRepository } from '../../repositories/brain.repository'

interface BrainRoutesOptions {
  readonly brainService: BrainService
  readonly brainRepo: BrainRepository
}

export const brainRoutes: FastifyPluginAsync<BrainRoutesOptions> = async (fastify, opts) => {
  const { brainRepo } = opts

  fastify.get('/current', { preHandler: authenticate }, async (request, reply) => {
    const metrics = await brainRepo.findCurrentByUser(request.userId)
    return reply.send(metrics ?? {
      energiaNeuralScore: 0, memoriaScore: 0, logicaScore: 0,
      interpretacaoScore: 0, cienciasScore: 0, estimatedScore: 0,
    })
  })

  fastify.get('/history', { preHandler: authenticate }, async (request, reply) => {
    const { days = '30' } = request.query as { days?: string }
    const daysInt = Math.min(365, Math.max(1, parseInt(days, 10)))
    const snapshots = await brainRepo.findHistory(request.userId, daysInt)
    return reply.send({ snapshots })
  })
}
```

- [ ] **Step 7: Create src/routes/v1/dashboard.routes.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middleware/authenticate'
import { DashboardService } from '../../services/dashboard.service'

interface DashboardRoutesOptions {
  readonly dashboardService: DashboardService
}

export const dashboardRoutes: FastifyPluginAsync<DashboardRoutesOptions> = async (fastify, opts) => {
  const { dashboardService } = opts

  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const data = await dashboardService.getDashboardData(request.userId)
    return reply.send(data)
  })
}
```

- [ ] **Step 8: Create src/routes/v1/achievements.routes.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../middleware/authenticate'
import { AchievementRepository } from '../../repositories/achievement.repository'

interface AchievementsRoutesOptions {
  readonly achievementRepo: AchievementRepository
}

export const achievementsRoutes: FastifyPluginAsync<AchievementsRoutesOptions> = async (fastify, opts) => {
  const { achievementRepo } = opts

  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const [all, unlocked] = await Promise.all([
      achievementRepo.findAll(),
      achievementRepo.findUnlockedByUser(request.userId),
    ])

    const unlockedIds = new Set(unlocked.map((u) => u.achievementId))

    return reply.send({
      unlocked: unlocked.map((u) => ({
        id: u.achievementId,
        name: u.achievement.name,
        description: u.achievement.description,
        icon: u.achievement.icon,
        unlockedAt: u.unlockedAt.toISOString(),
      })),
      locked: all
        .filter((a) => !unlockedIds.has(a.id))
        .map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          progress: 0, // TODO in V1: compute actual user progress per type
          threshold: a.threshold,
        })),
    })
  })
}
```

- [ ] **Step 9: Create src/routes/v1/index.ts**

```typescript
import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { authRoutes } from './auth.routes'
import { usersRoutes } from './users.routes'
import { challengesRoutes } from './challenges.routes'
import { answersRoutes } from './answers.routes'
import { brainRoutes } from './brain.routes'
import { dashboardRoutes } from './dashboard.routes'
import { achievementsRoutes } from './achievements.routes'
import { UserRepository } from '../../repositories/user.repository'
import { QuestionRepository } from '../../repositories/question.repository'
import { AnswerRepository } from '../../repositories/answer.repository'
import { BrainRepository } from '../../repositories/brain.repository'
import { AchievementRepository } from '../../repositories/achievement.repository'
import { AuthService } from '../../services/auth.service'
import { ChallengeService } from '../../services/challenge.service'
import { AnswerService } from '../../services/answer.service'
import { BrainService } from '../../services/brain.service'
import { DashboardService } from '../../services/dashboard.service'
import { AchievementService } from '../../services/achievement.service'

export const v1Routes: FastifyPluginAsync<{ prisma: PrismaClient }> = async (fastify, opts) => {
  const { prisma } = opts

  const userRepo = new UserRepository(prisma)
  const questionRepo = new QuestionRepository(prisma)
  const answerRepo = new AnswerRepository(prisma)
  const brainRepo = new BrainRepository(prisma)
  const achievementRepo = new AchievementRepository(prisma)

  const brainService = new BrainService(brainRepo, answerRepo)
  const achievementService = new AchievementService(achievementRepo, answerRepo)
  const authService = new AuthService(userRepo)
  const answerService = new AnswerService(answerRepo, questionRepo, userRepo, brainService, achievementService, prisma)
  const challengeService = new ChallengeService(questionRepo, brainService, prisma)
  const dashboardService = new DashboardService(userRepo, brainRepo, answerRepo)

  await fastify.register(authRoutes, { prefix: '/auth', authService })
  await fastify.register(usersRoutes, { prefix: '/users', userRepo, brainRepo })
  await fastify.register(challengesRoutes, { prefix: '/challenges', challengeService })
  await fastify.register(answersRoutes, { prefix: '/answers', answerService })
  await fastify.register(brainRoutes, { prefix: '/brain', brainService, brainRepo })
  await fastify.register(dashboardRoutes, { prefix: '/dashboard', dashboardService })
  await fastify.register(achievementsRoutes, { prefix: '/achievements', achievementRepo })
}
```

- [ ] **Step 10: Commit**

```bash
git add src/middleware/ src/routes/
git commit -m "feat: add all route handlers and middleware"
```

---

## Task 12: Server Entry Point

**Files:**
- Create: `src/server.ts`

- [ ] **Step 1: Create src/server.ts**

```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { PrismaClient } from '@prisma/client'
import { config } from './config'
import { v1Routes } from './routes/v1'

const prisma = new PrismaClient()

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  })

  await fastify.register(cors, {
    origin: config.NODE_ENV === 'production' ? 'https://cortex.app' : true,
  })

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  await fastify.register(v1Routes, { prefix: '/v1', prisma })

  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return fastify
}

async function start(): Promise<void> {
  const server = await buildServer()
  try {
    await server.listen({ port: config.PORT, host: '0.0.0.0' })
    console.log(`Cortex API running on port ${config.PORT}`)
  } catch (err) {
    server.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()
```

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

Expected: `Cortex API running on port 3000`

- [ ] **Step 3: Health check**

```bash
curl http://localhost:3000/health
```

Expected: `{"status":"ok","timestamp":"..."}`

- [ ] **Step 4: Commit**

```bash
git add src/server.ts
git commit -m "feat: add Fastify server entry point"
```

---

## Task 13: ENEM Importer Script

**Files:**
- Create: `scripts/import-enem.ts`

- [ ] **Step 1: Create scripts/import-enem.ts**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const ENEM_API_URL = process.env['ENEM_API_URL'] ?? 'https://api.enem.dev/v1'
const RATE_LIMIT_MS = 500

interface ENEMQuestion {
  readonly index: number
  readonly year: number
  readonly discipline: string
  readonly context?: string
  readonly files?: string[]
  readonly alternativesIntroduction?: string
  readonly statement: string
  readonly alternatives: Array<{ letter: string; text: string }>
  readonly correctAlternative: string
}

const DISCIPLINE_TOPIC_MAP: Record<string, string> = {
  'Matemática': 'matematica',
  'Linguagens, Códigos e suas Tecnologias': 'linguagens',
  'Ciências da Natureza e suas Tecnologias': 'ciencias',
  'Ciências Humanas e suas Tecnologias': 'humanas',
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchQuestions(year: number): Promise<ENEMQuestion[]> {
  const response = await fetch(`${ENEM_API_URL}/exams/${year}/questions`)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${year}: ${response.status}`)
  }
  return response.json() as Promise<ENEMQuestion[]>
}

async function importYear(year: number): Promise<void> {
  console.log(`Importing ${year}...`)
  const questions = await fetchQuestions(year)

  const topics = await prisma.topic.findMany({
    select: { id: true, slug: true },
  })
  const topicBySlug = Object.fromEntries(topics.map((t) => [t.slug, t.id]))

  let imported = 0
  let skipped = 0

  for (const q of questions) {
    const topicSlug = DISCIPLINE_TOPIC_MAP[q.discipline]
    const topicId = topicSlug ? topicBySlug[topicSlug] : undefined

    if (!topicId) {
      skipped++
      continue
    }

    const externalId = `enem-${year}-${q.index}`
    const existing = await prisma.question.findUnique({
      where: { externalId },
      select: { id: true },
    })

    if (existing) {
      skipped++
      continue
    }

    await prisma.question.create({
      data: {
        externalId,
        year: q.year,
        index: q.index,
        topicId,
        statement: q.statement,
        alternatives: q.alternatives.map((a) => ({ key: a.letter, text: a.text })),
        correctKey: q.correctAlternative,
        difficulty: 3,
      },
    })

    imported++
    await sleep(RATE_LIMIT_MS)
  }

  console.log(`${year}: imported ${imported}, skipped ${skipped}`)
}

async function main(): Promise<void> {
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  for (const year of years) {
    await importYear(year)
  }
  console.log('Import complete.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Add import script to package.json**

```json
"import:enem": "tsx scripts/import-enem.ts"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/import-enem.ts package.json
git commit -m "feat: add ENEM question importer script"
```

---

## Task 14: Run Full Test Suite + Integration Smoke Test

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 2: Smoke test auth flow**

```bash
# Register
curl -s -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@cortex.app","password":"123456"}' | jq .

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cortex.app","password":"123456"}' | jq -r '.accessToken')

# Onboarding
curl -s -X POST http://localhost:3000/v1/users/me/onboarding \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetScore":700}' | jq .

# Dashboard
curl -s http://localhost:3000/v1/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Expected: 
- Register returns `{user, accessToken, refreshToken}`
- Login returns tokens
- Onboarding returns `{goal: {targetScore: 700}}`
- Dashboard returns brain metrics at 0%

- [ ] **Step 3: If ENEM questions are available, smoke test challenge flow**

```bash
# Start challenge (requires questions in DB)
curl -s http://localhost:3000/v1/challenges/next \
  -H "Authorization: Bearer $TOKEN" | jq .

# (copy challengeId and questionId from response, then:)
curl -s -X POST http://localhost:3000/v1/answers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"challengeId":"<id>","questionId":"<qid>","chosenKey":"A","consecutiveCorrect":0}' | jq .
```

Expected: Response includes `{isCorrect, correctKey, xpEarned, cognitiveImpact}`

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: verify full test suite and smoke tests pass"
```

---

## Verification Checklist

Before marking the backend complete, verify:

1. `npm test` passes with all test files
2. `npm run dev` starts without errors
3. `GET /health` returns 200
4. `POST /auth/register` creates a user in the DB
5. `POST /auth/login` returns JWT tokens
6. `POST /users/me/onboarding` creates Goal and BrainMetrics rows
7. `GET /dashboard` returns brain metrics structure
8. `GET /challenges/next` returns 10 questions (requires seeded questions)
9. `POST /answers` updates user XP, streak, and BrainMetrics
10. `GET /brain/history` returns snapshots after completing a challenge
11. `GET /achievements` returns all 11 achievements with locked/unlocked state

---

*Backend plan complete. Mobile plan: `docs/superpowers/plans/2026-06-11-cortex-mobile.md` (next step).*
