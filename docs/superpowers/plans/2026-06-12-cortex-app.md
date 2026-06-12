# Cortex App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `cortex-app` Expo mobile frontend that consumes the `cortex-api` backend, delivering the full Cortex MVP (auth, onboarding, home, desafio, progresso, perfil).

**Architecture:** Expo 53 + Expo Router 4 (file-based routing) with two route groups — `(auth)` and `(app)`. State split between Zustand (auth) and TanStack Query (server). Axios interceptor handles JWT refresh automatically. All screens follow the dark design system defined in CLAUDE.md.

**Tech Stack:** Expo 53, Expo Router 4, NativeWind 4, Zustand 5, TanStack Query 5, axios, Expo SecureStore, react-hook-form, zod, react-native-svg, victory-native, Vitest + @testing-library/react-native

---

## File Map

```
cortex-app/
  app.json
  babel.config.js
  metro.config.js
  tailwind.config.js
  global.css
  nativewind-env.d.ts
  vitest.config.ts
  .env
  .env.example

  app/
    _layout.tsx                    # Root: QueryClient + fonts + global.css
    +not-found.tsx
    (auth)/
      _layout.tsx                  # Redirect authenticated → (app)
      index.tsx                    # Splash screen
      onboarding.tsx               # T1 / T2 / T3 steps
      login.tsx
      register.tsx
    (app)/
      _layout.tsx                  # Auth guard + Bottom Tab Bar
      index.tsx                    # Home
      progresso.tsx
      perfil.tsx
      desafio/
        index.tsx                  # Challenge session
        resultado.tsx              # Session result

  components/
    brain-status/
      BrainStatus.tsx
      AttributeBar.tsx
    challenge/
      QuestionCard.tsx
      AnswerOption.tsx
      FeedbackOverlay.tsx
      SessionProgress.tsx
    progress/
      EstimatedScoreChart.tsx
      CognitiveAttributeCard.tsx
      SessionHistoryItem.tsx
      AchievementGrid.tsx
    ui/
      Button.tsx
      Card.tsx
      Input.tsx
      Badge.tsx
      SkeletonLoader.tsx
      Modal.tsx

  lib/
    api.ts
    interceptors.ts
    query-keys.ts

  services/
    auth.service.ts
    user.service.ts
    challenge.service.ts
    dashboard.service.ts
    progress.service.ts

  stores/
    auth.store.ts

  types/
    domain.ts

  tests/
    services/auth.service.test.ts
    services/challenge.service.test.ts
    stores/auth.store.test.ts
    lib/interceptors.test.ts
    components/AnswerOption.test.tsx
    components/FeedbackOverlay.test.tsx
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `cortex-app/` (entire project)
- Create: `cortex-app/app.json`
- Create: `cortex-app/babel.config.js`
- Create: `cortex-app/metro.config.js`
- Create: `cortex-app/tailwind.config.js`
- Create: `cortex-app/global.css`
- Create: `cortex-app/nativewind-env.d.ts`
- Create: `cortex-app/.env`
- Create: `cortex-app/.env.example`

- [ ] **Step 1: Scaffold the Expo project**

Run from `/Users/enzoarruda/Documents/projects/cortex`:
```bash
npx create-expo-app@latest cortex-app --template blank-typescript
cd cortex-app
```

- [ ] **Step 2: Install all dependencies**

```bash
npx expo install expo-router expo-secure-store expo-font expo-status-bar expo-linking expo-constants react-native-safe-area-context react-native-screens react-native-svg react-native-gesture-handler react-native-reanimated

npm install nativewind tailwindcss

npm install zustand @tanstack/react-query axios react-hook-form zod

npm install victory-native

npm install @expo-google-fonts/public-sans

npm install --save-dev vitest @testing-library/react-native @testing-library/jest-native @vitest/coverage-v8 babel-jest
```

- [ ] **Step 3: Configure app.json**

Replace the contents of `app.json`:
```json
{
  "expo": {
    "name": "Cortex",
    "slug": "cortex-app",
    "scheme": "cortex",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#09090b"
      }
    },
    "ios": {
      "supportsTablet": false
    }
  }
}
```

- [ ] **Step 4: Update package.json main entry**

In `package.json`, set:
```json
"main": "expo-router/entry"
```

- [ ] **Step 5: Configure Tailwind**

Create `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `global.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Configure Babel**

Replace `babel.config.js`:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

- [ ] **Step 7: Configure Metro**

Replace `metro.config.js`:
```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

- [ ] **Step 8: Add NativeWind types**

Create `nativewind-env.d.ts`:
```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 9: Create environment files**

Create `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Create `.env.example`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

- [ ] **Step 10: Configure Vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

Create `tests/setup.ts`:
```ts
import '@testing-library/jest-native/extend-expect'
```

- [ ] **Step 11: Commit**

```bash
git add cortex-app/
git commit -m "feat(cortex-app): bootstrap Expo project with NativeWind and dependencies"
```

---

## Task 2: Types & Constants

**Files:**
- Create: `cortex-app/types/domain.ts`

- [ ] **Step 1: Write domain types**

Create `types/domain.ts`:
```ts
export type CognitiveAttribute =
  | 'ENERGIA_NEURAL'
  | 'MEMORIA'
  | 'LOGICA'
  | 'INTERPRETACAO'
  | 'CIENCIAS'

export interface User {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly image: string | null
  readonly xp: number
  readonly level: number
  readonly streakDays: number
  readonly hasCompletedOnboarding: boolean
}

export interface TokenPair {
  readonly accessToken: string
  readonly refreshToken: string
}

export interface AuthResponse {
  readonly user: User
  readonly tokens: TokenPair
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

export interface ChallengeSession {
  readonly challengeId: string
  readonly questions: readonly QuestionDTO[]
}

export interface CognitiveImpactItem {
  readonly attribute: CognitiveAttribute
  readonly delta: number
}

export interface AttemptResult {
  readonly isCorrect: boolean
  readonly correctKey: string
  readonly xpEarned: number
  readonly cognitiveImpact: readonly CognitiveImpactItem[]
  readonly explanation: string | null
}

export interface BrainMetrics {
  readonly energiaNeuralScore: number
  readonly memoriaScore: number
  readonly logicaScore: number
  readonly interpretacaoScore: number
  readonly cienciasScore: number
  readonly estimatedScore: number
}

export interface DashboardData {
  readonly user: {
    readonly name: string
    readonly level: number
    readonly xp: number
    readonly streakDays: number
  }
  readonly brainMetrics: BrainMetrics
  readonly recentActivity: {
    readonly questionsThisWeek: number
    readonly correctThisWeek: number
    readonly sessionsThisWeek: number
  }
}

export interface Achievement {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly icon: string
}

export interface UnlockedAchievement extends Achievement {
  readonly unlockedAt: string
}

export interface LockedAchievement extends Achievement {
  readonly progress: number
  readonly threshold: number
}

export interface AchievementsResponse {
  readonly unlocked: readonly UnlockedAchievement[]
  readonly locked: readonly LockedAchievement[]
}

export interface BrainHistoryResponse {
  readonly snapshots: readonly BrainMetrics[]
}
```

- [ ] **Step 2: Commit**

```bash
git add cortex-app/types/
git commit -m "feat(cortex-app): add domain types"
```

---

## Task 3: API Client & Interceptors

**Files:**
- Create: `cortex-app/lib/api.ts`
- Create: `cortex-app/lib/interceptors.ts`
- Create: `cortex-app/lib/query-keys.ts`
- Create: `cortex-app/tests/lib/interceptors.test.ts`

- [ ] **Step 1: Write the failing interceptor test**

Create `tests/lib/interceptors.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}))

vi.mock('../stores/auth.store', () => ({
  useAuthStore: { getState: vi.fn(() => ({ clearAuth: vi.fn() })) },
}))

vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

import * as SecureStore from 'expo-secure-store'
import { setupInterceptors } from '../../lib/interceptors'
import { api } from '../../lib/api'

describe('setupInterceptors', () => {
  beforeEach(() => vi.clearAllMocks())

  it('registers request and response interceptors', () => {
    setupInterceptors()
    expect(api.interceptors.request.use).toHaveBeenCalledOnce()
    expect(api.interceptors.response.use).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd cortex-app && npx vitest run tests/lib/interceptors.test.ts
```
Expected: FAIL — "Cannot find module '../../lib/interceptors'"

- [ ] **Step 3: Create the API instance**

Create `lib/api.ts`:
```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})
```

- [ ] **Step 4: Create the interceptors**

Create `lib/interceptors.ts`:
```ts
import { AxiosError, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'
import { api } from './api'
import { useAuthStore } from '../stores/auth.store'

const ACCESS_KEY = 'cortex_access_token'
const REFRESH_KEY = 'cortex_refresh_token'

let isRefreshing = false
let queue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

const flushQueue = (error: unknown, token: string | null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  queue = []
}

export const setupInterceptors = (): void => {
  api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(ACCESS_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      if (error.response?.status !== 401 || original._retry) return Promise.reject(error)

      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject })).then(
          (token) => { original.headers.Authorization = `Bearer ${token}`; return api(original) },
        )
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY)
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await api.post<{ accessToken: string; refreshToken: string }>(
          '/v1/auth/refresh',
          { refreshToken },
        )
        await SecureStore.setItemAsync(ACCESS_KEY, data.accessToken)
        await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken)
        flushQueue(null, data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (err) {
        flushQueue(err, null)
        await useAuthStore.getState().clearAuth()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    },
  )
}
```

- [ ] **Step 5: Create query keys**

Create `lib/query-keys.ts`:
```ts
export const QueryKeys = {
  dashboard: ['dashboard'] as const,
  brainCurrent: ['brain', 'current'] as const,
  brainHistory: (days: number) => ['brain', 'history', days] as const,
  achievements: ['achievements'] as const,
  userMe: ['user', 'me'] as const,
} as const
```

- [ ] **Step 6: Run test — expect PASS**

```bash
npx vitest run tests/lib/interceptors.test.ts
```
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add cortex-app/lib/ cortex-app/tests/lib/
git commit -m "feat(cortex-app): add API client, interceptors, and query keys"
```

---

## Task 4: Auth Store

**Files:**
- Create: `cortex-app/stores/auth.store.ts`
- Create: `cortex-app/tests/stores/auth.store.test.ts`

- [ ] **Step 1: Write the failing store tests**

Create `tests/stores/auth.store.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}))

import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../../stores/auth.store'

const mockUser = {
  id: '1', email: 'a@b.com', name: 'Test', image: null,
  xp: 0, level: 1, streakDays: 0, hasCompletedOnboarding: false,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false })
    vi.clearAllMocks()
  })

  it('starts unauthenticated', () => {
    const { isAuthenticated, user, accessToken } = useAuthStore.getState()
    expect(isAuthenticated).toBe(false)
    expect(user).toBeNull()
    expect(accessToken).toBeNull()
  })

  it('setAuth stores tokens and marks authenticated', async () => {
    await useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token')
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.accessToken).toBe('access-token')
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('cortex_access_token', 'access-token')
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('cortex_refresh_token', 'refresh-token')
  })

  it('clearAuth removes tokens and resets state', async () => {
    await useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token')
    await useAuthStore.getState().clearAuth()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('cortex_access_token')
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('cortex_refresh_token')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/stores/auth.store.test.ts
```
Expected: FAIL — "Cannot find module '../../stores/auth.store'"

- [ ] **Step 3: Implement the store**

Create `stores/auth.store.ts`:
```ts
import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import type { User } from '../types/domain'

const ACCESS_KEY = 'cortex_access_token'
const REFRESH_KEY = 'cortex_refresh_token'

interface AuthState {
  readonly user: User | null
  readonly accessToken: string | null
  readonly isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>
  clearAuth: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync(ACCESS_KEY, accessToken)
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken)
    set({ user, accessToken, isAuthenticated: true })
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(ACCESS_KEY)
    await SecureStore.deleteItemAsync(REFRESH_KEY)
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  setUser: (user) => set({ user }),
}))
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run tests/stores/auth.store.test.ts
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add cortex-app/stores/ cortex-app/tests/stores/
git commit -m "feat(cortex-app): add auth store with SecureStore persistence"
```

---

## Task 5: Services

**Files:**
- Create: `cortex-app/services/auth.service.ts`
- Create: `cortex-app/services/user.service.ts`
- Create: `cortex-app/services/challenge.service.ts`
- Create: `cortex-app/services/dashboard.service.ts`
- Create: `cortex-app/services/progress.service.ts`
- Create: `cortex-app/tests/services/auth.service.test.ts`
- Create: `cortex-app/tests/services/challenge.service.test.ts`

- [ ] **Step 1: Write failing auth service tests**

Create `tests/services/auth.service.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../lib/api', () => ({ api: { post: vi.fn(), delete: vi.fn() } }))

import { api } from '../../lib/api'
import { login, register, refresh } from '../../services/auth.service'

const mockTokens = { accessToken: 'at', refreshToken: 'rt' }
const mockUser = { id: '1', email: 'a@b.com', name: 'Test', image: null, xp: 0, level: 1, streakDays: 0, hasCompletedOnboarding: false }

describe('auth.service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('login calls POST /v1/auth/login and returns user + tokens', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { user: mockUser, tokens: mockTokens } })
    const result = await login({ email: 'a@b.com', password: '123456' })
    expect(api.post).toHaveBeenCalledWith('/v1/auth/login', { email: 'a@b.com', password: '123456' })
    expect(result.tokens.accessToken).toBe('at')
  })

  it('register calls POST /v1/auth/register', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { user: mockUser, tokens: mockTokens } })
    const result = await register({ name: 'Test', email: 'a@b.com', password: '123456' })
    expect(api.post).toHaveBeenCalledWith('/v1/auth/register', { name: 'Test', email: 'a@b.com', password: '123456' })
    expect(result.user.name).toBe('Test')
  })

  it('refresh calls POST /v1/auth/refresh', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockTokens })
    const result = await refresh('old-rt')
    expect(api.post).toHaveBeenCalledWith('/v1/auth/refresh', { refreshToken: 'old-rt' })
    expect(result.accessToken).toBe('at')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/services/auth.service.test.ts
```
Expected: FAIL — "Cannot find module '../../services/auth.service'"

- [ ] **Step 3: Implement auth service**

Create `services/auth.service.ts`:
```ts
import { api } from '../lib/api'
import type { AuthResponse, TokenPair } from '../types/domain'

interface LoginInput {
  readonly email: string
  readonly password: string
}

interface RegisterInput {
  readonly name: string
  readonly email: string
  readonly password: string
}

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/v1/auth/login', input)
  return data
}

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/v1/auth/register', input)
  return data
}

export const refresh = async (refreshToken: string): Promise<TokenPair> => {
  const { data } = await api.post<TokenPair>('/v1/auth/refresh', { refreshToken })
  return data
}

export const logout = async (): Promise<void> => {
  await api.delete('/v1/auth/logout')
}
```

- [ ] **Step 4: Run auth tests — expect PASS**

```bash
npx vitest run tests/services/auth.service.test.ts
```
Expected: PASS (3 tests)

- [ ] **Step 5: Write failing challenge service tests**

Create `tests/services/challenge.service.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../lib/api', () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }))

import { api } from '../../lib/api'
import { getNextChallenge, submitAnswer, completeChallenge } from '../../services/challenge.service'

describe('challenge.service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getNextChallenge calls GET /v1/challenges/next', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { challengeId: 'c1', questions: [] } })
    const result = await getNextChallenge()
    expect(api.get).toHaveBeenCalledWith('/v1/challenges/next', { params: {} })
    expect(result.challengeId).toBe('c1')
  })

  it('submitAnswer calls POST /v1/answers', async () => {
    const mockResult = { isCorrect: true, correctKey: 'A', xpEarned: 10, cognitiveImpact: [], explanation: null }
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResult })
    const result = await submitAnswer({ challengeId: 'c1', questionId: 'q1', chosenKey: 'A', consecutiveCorrect: 0 })
    expect(api.post).toHaveBeenCalledWith('/v1/answers', expect.objectContaining({ challengeId: 'c1' }))
    expect(result.isCorrect).toBe(true)
  })

  it('completeChallenge calls PATCH /v1/challenges/:id/complete', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: { success: true } })
    await completeChallenge('c1')
    expect(api.patch).toHaveBeenCalledWith('/v1/challenges/c1/complete')
  })
})
```

- [ ] **Step 6: Implement challenge + remaining services**

Create `services/challenge.service.ts`:
```ts
import { api } from '../lib/api'
import type { ChallengeSession, AttemptResult } from '../types/domain'

interface SubmitAnswerInput {
  readonly challengeId: string
  readonly questionId: string
  readonly chosenKey: string
  readonly consecutiveCorrect: number
}

export const getNextChallenge = async (params: { topicId?: string; difficulty?: number } = {}): Promise<ChallengeSession> => {
  const { data } = await api.get<ChallengeSession>('/v1/challenges/next', { params })
  return data
}

export const submitAnswer = async (input: SubmitAnswerInput): Promise<AttemptResult> => {
  const { data } = await api.post<AttemptResult>('/v1/answers', input)
  return data
}

export const completeChallenge = async (challengeId: string): Promise<void> => {
  await api.patch(`/v1/challenges/${challengeId}/complete`)
}
```

Create `services/dashboard.service.ts`:
```ts
import { api } from '../lib/api'
import type { DashboardData } from '../types/domain'

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get<DashboardData>('/v1/dashboard')
  return data
}
```

Create `services/user.service.ts`:
```ts
import { api } from '../lib/api'
import type { User } from '../types/domain'

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/v1/users/me')
  return data
}

export const updateMe = async (payload: Partial<Pick<User, 'name'>>): Promise<User> => {
  const { data } = await api.patch<User>('/v1/users/me', payload)
  return data
}

export const completeOnboarding = async (targetScore: number): Promise<void> => {
  await api.post('/v1/users/me/onboarding', { targetScore })
}
```

Create `services/progress.service.ts`:
```ts
import { api } from '../lib/api'
import type { BrainMetrics, BrainHistoryResponse, AchievementsResponse } from '../types/domain'

export const getBrainCurrent = async (): Promise<BrainMetrics> => {
  const { data } = await api.get<BrainMetrics>('/v1/brain/current')
  return data
}

export const getBrainHistory = async (days = 30): Promise<BrainHistoryResponse> => {
  const { data } = await api.get<BrainHistoryResponse>('/v1/brain/history', { params: { days } })
  return data
}

export const getAchievements = async (): Promise<AchievementsResponse> => {
  const { data } = await api.get<AchievementsResponse>('/v1/achievements')
  return data
}
```

- [ ] **Step 7: Run all service tests — expect PASS**

```bash
npx vitest run tests/services/
```
Expected: PASS (6 tests)

- [ ] **Step 8: Commit**

```bash
git add cortex-app/services/ cortex-app/tests/services/
git commit -m "feat(cortex-app): add services with TDD coverage"
```

---

## Task 6: UI Primitives

**Files:**
- Create: `cortex-app/components/ui/Button.tsx`
- Create: `cortex-app/components/ui/Card.tsx`
- Create: `cortex-app/components/ui/Input.tsx`
- Create: `cortex-app/components/ui/Badge.tsx`
- Create: `cortex-app/components/ui/SkeletonLoader.tsx`
- Create: `cortex-app/components/ui/Modal.tsx`

- [ ] **Step 1: Create Button**

Create `components/ui/Button.tsx`:
```tsx
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'

interface ButtonProps {
  readonly label: string
  readonly onPress: () => void
  readonly variant?: 'primary' | 'secondary' | 'ghost'
  readonly loading?: boolean
  readonly disabled?: boolean
}

/** Reusable button following the Cortex design system. */
export const Button = ({ label, onPress, variant = 'primary', loading = false, disabled = false }: ButtonProps) => {
  const base = 'h-14 w-full rounded-xl items-center justify-center'
  const variants = {
    primary: 'bg-indigo-500',
    secondary: 'bg-zinc-800 border border-zinc-700',
    ghost: 'bg-transparent',
  }
  const textVariants = {
    primary: 'text-white font-bold text-base',
    secondary: 'text-zinc-100 font-semibold text-base',
    ghost: 'text-zinc-400 text-base',
  }

  return (
    <TouchableOpacity
      className={`${base} ${variants[variant]} ${disabled || loading ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#6366f1'} />
      ) : (
        <Text className={textVariants[variant]}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}
```

- [ ] **Step 2: Create Card**

Create `components/ui/Card.tsx`:
```tsx
import { View } from 'react-native'

interface CardProps {
  readonly children: React.ReactNode
  readonly className?: string
}

/** Surface card following bg-zinc-900 + border-zinc-800 design token. */
export const Card = ({ children, className = '' }: CardProps) => (
  <View className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 ${className}`}>
    {children}
  </View>
)
```

- [ ] **Step 3: Create Input**

Create `components/ui/Input.tsx`:
```tsx
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface InputProps extends TextInputProps {
  readonly label: string
  readonly error?: string
  readonly isPassword?: boolean
}

/** Form input with label, inline error, and optional password toggle. */
export const Input = ({ label, error, isPassword = false, ...props }: InputProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <View className="gap-1">
      <Text className="text-zinc-400 text-sm font-medium">{label}</Text>
      <View className="relative">
        <TextInput
          className={`bg-zinc-900 border rounded-xl px-4 h-14 text-zinc-100 text-base ${error ? 'border-red-500' : 'border-zinc-800'}`}
          placeholderTextColor="#71717a"
          secureTextEntry={isPassword && !visible}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setVisible((v) => !v)}
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#71717a" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-400 text-sm">{error}</Text>}
    </View>
  )
}
```

- [ ] **Step 4: Create Badge**

Create `components/ui/Badge.tsx`:
```tsx
import { View, Text } from 'react-native'

interface BadgeProps {
  readonly label: string
  readonly color?: 'indigo' | 'zinc' | 'emerald' | 'rose'
}

const colorMap = {
  indigo: 'bg-indigo-500/20 text-indigo-400',
  zinc: 'bg-zinc-800 text-zinc-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  rose: 'bg-rose-500/20 text-rose-400',
}

/** Small label badge. */
export const Badge = ({ label, color = 'zinc' }: BadgeProps) => {
  const [bg, text] = colorMap[color].split(' ')
  return (
    <View className={`px-2 py-0.5 rounded-full ${bg}`}>
      <Text className={`text-xs font-medium ${text}`}>{label}</Text>
    </View>
  )
}
```

- [ ] **Step 5: Create SkeletonLoader**

Create `components/ui/SkeletonLoader.tsx`:
```tsx
import { useEffect, useRef } from 'react'
import { Animated, View, ViewStyle } from 'react-native'

interface SkeletonLoaderProps {
  readonly width?: number | string
  readonly height?: number
  readonly rounded?: boolean
  readonly style?: ViewStyle
}

/** Pulsing skeleton placeholder. Use same dimensions as the real content. */
export const SkeletonLoader = ({ width = '100%', height = 20, rounded = false, style }: SkeletonLoaderProps) => {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[{ width: width as number, height, opacity, backgroundColor: '#27272a', borderRadius: rounded ? 999 : 8 }, style]}
    />
  )
}
```

- [ ] **Step 6: Create Modal**

Create `components/ui/Modal.tsx`:
```tsx
import { Modal as RNModal, View, Text } from 'react-native'
import { Button } from './Button'

interface ModalProps {
  readonly visible: boolean
  readonly title: string
  readonly message: string
  readonly confirmLabel?: string
  readonly cancelLabel?: string
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

/** Confirmation modal for destructive actions (e.g., exit challenge). */
export const Modal = ({ visible, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onCancel }: ModalProps) => (
  <RNModal visible={visible} transparent animationType="fade">
    <View className="flex-1 bg-black/60 justify-center items-center px-6">
      <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full gap-4">
        <Text className="text-zinc-100 text-lg font-bold">{title}</Text>
        <Text className="text-zinc-400 text-sm">{message}</Text>
        <View className="gap-2">
          <Button label={confirmLabel} onPress={onConfirm} variant="secondary" />
          <Button label={cancelLabel} onPress={onCancel} />
        </View>
      </View>
    </View>
  </RNModal>
)
```

- [ ] **Step 7: Commit**

```bash
git add cortex-app/components/ui/
git commit -m "feat(cortex-app): add UI primitive components"
```

---

## Task 7: Navigation Shell

**Files:**
- Create: `cortex-app/app/_layout.tsx`
- Create: `cortex-app/app/+not-found.tsx`
- Create: `cortex-app/app/(auth)/_layout.tsx`
- Create: `cortex-app/app/(app)/_layout.tsx`

- [ ] **Step 1: Create root layout**

Create `app/_layout.tsx`:
```tsx
import '../global.css'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts, PublicSans_400Regular, PublicSans_700Bold } from '@expo-google-fonts/public-sans'
import * as SplashScreen from 'expo-splash-screen'
import { setupInterceptors } from '../lib/interceptors'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

setupInterceptors()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PublicSans_400Regular, PublicSans_700Bold })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 2: Create 404 screen**

Create `app/+not-found.tsx`:
```tsx
import { View, Text } from 'react-native'
import { Link } from 'expo-router'

export default function NotFound() {
  return (
    <View className="flex-1 bg-zinc-950 items-center justify-center gap-4">
      <Text className="text-zinc-100 text-xl font-bold">Tela não encontrada</Text>
      <Link href="/" className="text-indigo-500 text-base">Voltar ao início</Link>
    </View>
  )
}
```

- [ ] **Step 3: Create auth group layout**

Create `app/(auth)/_layout.tsx`:
```tsx
import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

export default function AuthLayout() {
  const router = useRouter()

  useEffect(() => {
    SecureStore.getItemAsync('cortex_access_token').then((token) => {
      if (token) router.replace('/(app)')
    })
  }, [])

  return <Stack screenOptions={{ headerShown: false }} />
}
```

- [ ] **Step 4: Create app group layout with Bottom Tab Bar**

Create `app/(app)/_layout.tsx`:
```tsx
import { useEffect } from 'react'
import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store'

export default function AppLayout() {
  const router = useRouter()

  useEffect(() => {
    SecureStore.getItemAsync('cortex_access_token').then((token) => {
      if (!token) router.replace('/(auth)')
    })
  }, [])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#09090b', borderTopColor: '#27272a', borderTopWidth: 1 },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#71717a',
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="brain-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progresso"
        options={{
          title: 'Progresso',
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="desafio/index" options={{ href: null }} />
      <Tabs.Screen name="desafio/resultado" options={{ href: null }} />
    </Tabs>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add cortex-app/app/
git commit -m "feat(cortex-app): add navigation shell with auth guards and tab bar"
```

---

## Task 8: Splash & Onboarding

**Files:**
- Create: `cortex-app/app/(auth)/index.tsx`
- Create: `cortex-app/app/(auth)/onboarding.tsx`

- [ ] **Step 1: Create Splash screen**

Create `app/(auth)/index.tsx`:
```tsx
import { useEffect, useRef } from 'react'
import { View, Text, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { getMe } from '../../services/user.service'
import { useAuthStore } from '../../stores/auth.store'

export default function SplashScreen() {
  const router = useRouter()
  const logoOpacity = useRef(new Animated.Value(0)).current
  const titleTranslate = useRef(new Animated.Value(12)).current
  const titleOpacity = useRef(new Animated.Value(0)).current
  const taglineOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start()

    const resolve = async () => {
      const token = await SecureStore.getItemAsync('cortex_access_token')
      if (!token) { router.replace('/(auth)/onboarding'); return }
      try {
        const user = await getMe()
        useAuthStore.getState().setUser(user)
        if (!user.hasCompletedOnboarding) { router.replace('/(auth)/onboarding'); return }
        router.replace('/(app)')
      } catch {
        router.replace('/(auth)/login')
      }
    }
    resolve()
  }, [])

  return (
    <View className="flex-1 bg-zinc-950 items-center justify-center gap-3">
      <Animated.View style={{ opacity: logoOpacity }}>
        <View className="w-16 h-16 items-center justify-center">
          <Text className="text-indigo-500 text-5xl font-bold">C</Text>
        </View>
      </Animated.View>
      <Animated.Text
        style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslate }] }}
        className="text-zinc-100 text-2xl font-bold tracking-widest"
      >
        CORTEX
      </Animated.Text>
      <Animated.Text style={{ opacity: taglineOpacity }} className="text-zinc-500 text-sm">
        Fortaleça seu cérebro
      </Animated.Text>
    </View>
  )
}
```

- [ ] **Step 2: Create Onboarding screen**

Create `app/(auth)/onboarding.tsx`:
```tsx
import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { completeOnboarding } from '../../services/user.service'
import { useAuthStore } from '../../stores/auth.store'
import { Button } from '../../components/ui/Button'

const TARGET_SCORES = [500, 600, 700, 800, 900] as const

const ATTRIBUTES = [
  { label: 'Energia Neural', color: 'text-indigo-400', emoji: '🧠' },
  { label: 'Memória de Longo Prazo', color: 'text-violet-400', emoji: '🔵' },
  { label: 'Lógica', color: 'text-blue-400', emoji: '⚡' },
  { label: 'Interpretação', color: 'text-emerald-400', emoji: '📖' },
  { label: 'Raciocínio Científico', color: 'text-rose-400', emoji: '🔬' },
]

export default function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  const mutation = useMutation({
    mutationFn: async () => {
      await completeOnboarding(selectedScore!)
    },
    onSuccess: () => router.replace('/(app)'),
  })

  if (step === 0) return (
    <View className="flex-1 bg-zinc-950 px-6 justify-center items-center gap-8">
      <View className="w-full h-48 items-center justify-center">
        <Text className="text-6xl">🧠</Text>
      </View>
      <Text className="text-zinc-100 text-2xl font-bold text-center">Seu cérebro está pronto para evoluir</Text>
      <Text className="text-zinc-400 text-base text-center">Cada questão do ENEM fortalece capacidades reais do seu cérebro.</Text>
      <Button label="Começar" onPress={() => setStep(1)} />
      <View className="flex-row gap-2">
        {[0, 1, 2].map((i) => (
          <View key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-indigo-500' : 'bg-zinc-700'}`} />
        ))}
      </View>
    </View>
  )

  if (step === 1) return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-6 py-16 gap-8">
      <Text className="text-zinc-100 text-2xl font-bold">Você não está fazendo questões</Text>
      <Text className="text-zinc-400 text-base">Você está fortalecendo atributos do seu cérebro.</Text>
      <View className="gap-3">
        {ATTRIBUTES.map((attr) => (
          <View key={attr.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex-row items-center gap-3">
            <Text className="text-xl">{attr.emoji}</Text>
            <View className="flex-1">
              <Text className={`font-semibold ${attr.color}`}>{attr.label}</Text>
              <View className="h-1.5 bg-zinc-800 rounded-full mt-2" />
            </View>
            <Text className="text-zinc-600 text-xs">Bloqueado</Text>
          </View>
        ))}
      </View>
      <Button label="Entendi" onPress={() => setStep(2)} />
      <View className="flex-row gap-2 justify-center">
        {[0, 1, 2].map((i) => (
          <View key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-indigo-500' : 'bg-zinc-700'}`} />
        ))}
      </View>
    </ScrollView>
  )

  return (
    <View className="flex-1 bg-zinc-950 px-6 py-16 gap-8">
      <Text className="text-zinc-100 text-2xl font-bold">Qual é a sua meta no ENEM?</Text>
      <Text className="text-zinc-400 text-base">Calculamos seu progresso em direção a essa nota.</Text>
      <View className="flex-row flex-wrap gap-3">
        {TARGET_SCORES.map((score, i) => (
          <TouchableOpacity
            key={score}
            className={`bg-zinc-900 border-2 rounded-xl p-4 items-center justify-center ${i === 4 ? 'w-full' : 'flex-1'} ${selectedScore === score ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800'}`}
            onPress={() => setSelectedScore(score)}
          >
            <Text className={`text-lg font-bold ${selectedScore === score ? 'text-indigo-400' : 'text-zinc-100'}`}>
              {score}{i === 4 ? '+' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button label="Continuar" onPress={() => mutation.mutate()} disabled={!selectedScore} loading={mutation.isPending} />
      <Text className="text-zinc-600 text-xs text-center">Você pode ajustar sua meta depois.</Text>
      <View className="flex-row gap-2 justify-center">
        {[0, 1, 2].map((i) => (
          <View key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-indigo-500' : 'bg-zinc-700'}`} />
        ))}
      </View>
    </View>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add cortex-app/app/(auth)/
git commit -m "feat(cortex-app): add splash and onboarding screens"
```

---

## Task 9: Login & Register Screens

**Files:**
- Create: `cortex-app/app/(auth)/login.tsx`
- Create: `cortex-app/app/(auth)/register.tsx`

- [ ] **Step 1: Create Login screen**

Create `app/(auth)/login.tsx`:
```tsx
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { login } from '../../services/auth.service'
import { useAuthStore } from '../../stores/auth.store'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export default function LoginScreen() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { control, handleSubmit, formState: { errors }, setError } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (data: FormData) => login(data),
    onSuccess: async ({ user, tokens }) => {
      await setAuth(user, tokens.accessToken, tokens.refreshToken)
      if (!user.hasCompletedOnboarding) { router.replace('/(auth)/onboarding'); return }
      router.replace('/(app)')
    },
    onError: () => setError('root', { message: 'Email ou senha incorretos.' }),
  })

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-6 py-16 gap-8">
      <View className="gap-1">
        <Text className="text-zinc-100 text-2xl font-bold">Entrar no Cortex</Text>
        <Text className="text-zinc-500 text-base">Continue sua jornada de evolução.</Text>
      </View>
      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input label="Email" placeholder="seu@email.com" onChangeText={onChange} value={value} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input label="Senha" placeholder="••••••" onChangeText={onChange} value={value} error={errors.password?.message} isPassword />
          )}
        />
        {errors.root && <Text className="text-red-400 text-sm">{errors.root.message}</Text>}
      </View>
      <Button label="Entrar" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending} />
      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text className="text-zinc-500 text-sm text-center">
          Não tem conta? <Text className="text-indigo-500 font-semibold">Cadastre-se</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
```

- [ ] **Step 2: Create Register screen**

Create `app/(auth)/register.tsx`:
```tsx
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { register } from '../../services/auth.service'
import { useAuthStore } from '../../stores/auth.store'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export default function RegisterScreen() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { control, handleSubmit, formState: { errors }, setError } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (data: FormData) => register(data),
    onSuccess: async ({ user, tokens }) => {
      await setAuth(user, tokens.accessToken, tokens.refreshToken)
      router.replace('/(auth)/onboarding')
    },
    onError: () => setError('root', { message: 'Este email já está em uso.' }),
  })

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-6 py-16 gap-8">
      <View className="gap-1">
        <Text className="text-zinc-100 text-2xl font-bold">Criar conta</Text>
        <Text className="text-zinc-500 text-base">Comece sua jornada de evolução.</Text>
      </View>
      <View className="gap-4">
        <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
          <Input label="Nome completo" placeholder="Seu nome" onChangeText={onChange} value={value} error={errors.name?.message} />
        )} />
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <Input label="Email" placeholder="seu@email.com" onChangeText={onChange} value={value} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" />
        )} />
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <Input label="Senha" placeholder="••••••" onChangeText={onChange} value={value} error={errors.password?.message} isPassword />
        )} />
        {errors.root && <Text className="text-red-400 text-sm">{errors.root.message}</Text>}
      </View>
      <Button label="Criar conta" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending} />
      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-zinc-500 text-sm text-center">
          Já tem conta? <Text className="text-indigo-500 font-semibold">Entrar</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
```

- [ ] **Step 3: Install @hookform/resolvers**

```bash
npm install @hookform/resolvers
```

- [ ] **Step 4: Commit**

```bash
git add cortex-app/app/(auth)/login.tsx cortex-app/app/(auth)/register.tsx
git commit -m "feat(cortex-app): add login and register screens"
```

---

## Task 10: Brain Status Components

**Files:**
- Create: `cortex-app/components/brain-status/AttributeBar.tsx`
- Create: `cortex-app/components/brain-status/BrainStatus.tsx`

- [ ] **Step 1: Create AttributeBar**

Create `components/brain-status/AttributeBar.tsx`:
```tsx
import { useEffect, useRef } from 'react'
import { View, Text, Animated } from 'react-native'
import type { CognitiveAttribute } from '../../types/domain'

interface AttributeBarProps {
  readonly attribute: CognitiveAttribute
  readonly score: number
}

const ATTR_CONFIG: Record<CognitiveAttribute, { label: string; emoji: string; color: string; fill: string }> = {
  ENERGIA_NEURAL:    { label: 'Energia Neural',          emoji: '🧠', color: 'text-indigo-400',  fill: 'bg-indigo-500'  },
  MEMORIA:           { label: 'Memória de Longo Prazo',  emoji: '🔵', color: 'text-violet-400',  fill: 'bg-violet-500'  },
  LOGICA:            { label: 'Lógica',                  emoji: '⚡', color: 'text-blue-400',    fill: 'bg-blue-500'    },
  INTERPRETACAO:     { label: 'Interpretação',           emoji: '📖', color: 'text-emerald-400', fill: 'bg-emerald-500' },
  CIENCIAS:          { label: 'Raciocínio Científico',   emoji: '🔬', color: 'text-rose-400',    fill: 'bg-rose-500'    },
}

/** Single cognitive attribute row with animated progress bar. */
export const AttributeBar = ({ attribute, score }: AttributeBarProps) => {
  const config = ATTR_CONFIG[attribute]
  const width = useRef(new Animated.Value(0)).current
  const pct = Math.min(100, Math.max(0, score))

  useEffect(() => {
    Animated.timing(width, { toValue: pct, duration: 400, useNativeDriver: false }).start()
  }, [pct])

  return (
    <View className="gap-1">
      <View className="flex-row justify-between items-center">
        <Text className={`text-sm font-medium ${config.color}`}>{config.emoji} {config.label}</Text>
        <Text className="text-zinc-500 text-xs">{Math.round(pct)}</Text>
      </View>
      <View className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <Animated.View
          className={`h-full rounded-full ${config.fill}`}
          style={{ width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }}
        />
      </View>
    </View>
  )
}
```

- [ ] **Step 2: Create BrainStatus**

Create `components/brain-status/BrainStatus.tsx`:
```tsx
import { View, Text } from 'react-native'
import { Card } from '../ui/Card'
import { AttributeBar } from './AttributeBar'
import { SkeletonLoader } from '../ui/SkeletonLoader'
import type { BrainMetrics } from '../../types/domain'

interface BrainStatusProps {
  readonly metrics?: BrainMetrics
  readonly loading?: boolean
}

/** Card showing all 5 cognitive attributes and estimated ENEM score. */
export const BrainStatus = ({ metrics, loading = false }: BrainStatusProps) => {
  if (loading) return (
    <Card className="gap-4">
      <SkeletonLoader height={20} width="60%" />
      {[1, 2, 3, 4, 5].map((i) => <SkeletonLoader key={i} height={28} />)}
    </Card>
  )

  if (!metrics) return null

  return (
    <Card className="gap-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-zinc-100 font-bold text-base">Brain Status</Text>
        <View className="bg-indigo-500/20 px-3 py-1 rounded-full">
          <Text className="text-indigo-400 text-sm font-bold">{Math.round(metrics.estimatedScore)} pts</Text>
        </View>
      </View>
      <View className="gap-3">
        <AttributeBar attribute="ENERGIA_NEURAL" score={metrics.energiaNeuralScore} />
        <AttributeBar attribute="MEMORIA" score={metrics.memoriaScore} />
        <AttributeBar attribute="LOGICA" score={metrics.logicaScore} />
        <AttributeBar attribute="INTERPRETACAO" score={metrics.interpretacaoScore} />
        <AttributeBar attribute="CIENCIAS" score={metrics.cienciasScore} />
      </View>
    </Card>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add cortex-app/components/brain-status/
git commit -m "feat(cortex-app): add BrainStatus and AttributeBar components"
```

---

## Task 11: Home Screen

**Files:**
- Create: `cortex-app/app/(app)/index.tsx`

- [ ] **Step 1: Create Home screen**

Create `app/(app)/index.tsx`:
```tsx
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../services/dashboard.service'
import { BrainStatus } from '../../components/brain-status/BrainStatus'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../lib/query-keys'
import { useAuthStore } from '../../stores/auth.store'

export default function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: QueryKeys.dashboard,
    queryFn: getDashboard,
    staleTime: 30_000,
  })

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-4 pt-16 pb-8 gap-6">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-zinc-500 text-sm">{greeting()},</Text>
          <Text className="text-zinc-100 text-xl font-bold">{user?.name?.split(' ')[0] ?? '...'}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {isLoading ? <SkeletonLoader width={60} height={24} rounded /> : (
            <View className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Text className="text-orange-400">🔥</Text>
              <Text className="text-zinc-100 text-sm font-semibold">{data?.user.streakDays ?? 0}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Brain Status */}
      <BrainStatus metrics={data?.brainMetrics} loading={isLoading} />

      {/* Error state */}
      {isError && (
        <Card>
          <Text className="text-zinc-400 text-sm text-center">Algo deu errado. Tente novamente.</Text>
          <TouchableOpacity onPress={() => refetch()} className="mt-3">
            <Text className="text-indigo-500 text-sm text-center font-semibold">Tentar novamente</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Stats row */}
      {!isLoading && data && (
        <View className="flex-row gap-3">
          <Card className="flex-1 items-center gap-1">
            <Text className="text-zinc-100 text-2xl font-bold">{data.recentActivity.questionsThisWeek}</Text>
            <Text className="text-zinc-500 text-xs text-center">questões essa semana</Text>
          </Card>
          <Card className="flex-1 items-center gap-1">
            <Text className="text-zinc-100 text-2xl font-bold">Nv {data.user.level}</Text>
            <Text className="text-zinc-500 text-xs text-center">{data.user.xp} XP</Text>
          </Card>
        </View>
      )}

      {/* CTA */}
      <Button label="COMEÇAR DESAFIO" onPress={() => router.push('/(app)/desafio')} />
    </ScrollView>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add cortex-app/app/(app)/index.tsx
git commit -m "feat(cortex-app): add Home screen"
```

---

## Task 12: Challenge Components

**Files:**
- Create: `cortex-app/components/challenge/SessionProgress.tsx`
- Create: `cortex-app/components/challenge/QuestionCard.tsx`
- Create: `cortex-app/components/challenge/AnswerOption.tsx`
- Create: `cortex-app/components/challenge/FeedbackOverlay.tsx`
- Create: `cortex-app/tests/components/AnswerOption.test.tsx`
- Create: `cortex-app/tests/components/FeedbackOverlay.test.tsx`

- [ ] **Step 1: Write failing AnswerOption test**

Create `tests/components/AnswerOption.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react-native'
import { AnswerOption } from '../../components/challenge/AnswerOption'

describe('AnswerOption', () => {
  it('renders label text', () => {
    const { getByText } = render(
      <AnswerOption letter="A" text="Alternativa A" state="idle" onPress={vi.fn()} />
    )
    expect(getByText('Alternativa A')).toBeTruthy()
  })

  it('calls onPress when tapped', () => {
    const onPress = vi.fn()
    const { getByText } = render(
      <AnswerOption letter="A" text="Alternativa A" state="idle" onPress={onPress} />
    )
    fireEvent.press(getByText('Alternativa A'))
    expect(onPress).toHaveBeenCalledOnce()
  })

  it('does not call onPress when state is correct', () => {
    const onPress = vi.fn()
    const { getByText } = render(
      <AnswerOption letter="A" text="Alternativa A" state="correct" onPress={onPress} />
    )
    fireEvent.press(getByText('Alternativa A'))
    expect(onPress).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/components/AnswerOption.test.tsx
```

- [ ] **Step 3: Create SessionProgress**

Create `components/challenge/SessionProgress.tsx`:
```tsx
import { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SessionProgressProps {
  readonly current: number
  readonly total: number
  readonly onExit: () => void
}

/** Challenge session header: progress bar + question counter + exit button. */
export const SessionProgress = ({ current, total, onExit }: SessionProgressProps) => {
  const progress = useRef(new Animated.Value(0)).current
  const pct = total > 0 ? current / total : 0

  useEffect(() => {
    Animated.timing(progress, { toValue: pct, duration: 400, useNativeDriver: false }).start()
  }, [pct])

  return (
    <View className="gap-2 px-4 pt-14 pb-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-zinc-500 text-sm">{current}/{total}</Text>
        <TouchableOpacity onPress={onExit} accessibilityLabel="Sair do desafio">
          <Ionicons name="close-outline" size={24} color="#71717a" />
        </TouchableOpacity>
      </View>
      <View className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-indigo-500 rounded-full"
          style={{ width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }}
        />
      </View>
    </View>
  )
}
```

- [ ] **Step 4: Create QuestionCard**

Create `components/challenge/QuestionCard.tsx`:
```tsx
import { View, Text, ScrollView } from 'react-native'
import { Badge } from '../ui/Badge'
import type { QuestionDTO } from '../../types/domain'

interface QuestionCardProps {
  readonly question: QuestionDTO
}

const ATTR_LABELS: Record<string, string> = {
  ENERGIA_NEURAL: 'Energia Neural',
  MEMORIA: 'Memória',
  LOGICA: 'Lógica',
  INTERPRETACAO: 'Interpretação',
  CIENCIAS: 'Ciências',
}

/** Displays question statement, topic, and year. */
export const QuestionCard = ({ question }: QuestionCardProps) => (
  <View className="gap-3 px-4">
    <View className="flex-row gap-2 flex-wrap">
      <Badge label={question.topic.name} color="indigo" />
      <Badge label={String(question.year)} color="zinc" />
      <Badge label={ATTR_LABELS[question.topic.cognitiveAttribute] ?? question.topic.cognitiveAttribute} color="zinc" />
    </View>
    <ScrollView className="max-h-64">
      <Text className="text-zinc-100 text-base leading-6">{question.statement}</Text>
    </ScrollView>
  </View>
)
```

- [ ] **Step 5: Create AnswerOption**

Create `components/challenge/AnswerOption.tsx`:
```tsx
import { TouchableOpacity, View, Text } from 'react-native'

type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong'

interface AnswerOptionProps {
  readonly letter: string
  readonly text: string
  readonly state: AnswerState
  readonly onPress: () => void
}

const stateStyles: Record<AnswerState, { container: string; letter: string; text: string }> = {
  idle:     { container: 'bg-zinc-900 border-zinc-800',   letter: 'bg-zinc-800 text-zinc-400',   text: 'text-zinc-200' },
  selected: { container: 'bg-indigo-500/10 border-indigo-500', letter: 'bg-indigo-500 text-white', text: 'text-zinc-100' },
  correct:  { container: 'bg-emerald-500/10 border-emerald-500', letter: 'bg-emerald-500 text-white', text: 'text-zinc-100' },
  wrong:    { container: 'bg-red-500/10 border-red-500',  letter: 'bg-red-500 text-white',       text: 'text-zinc-400' },
}

/** Tappable answer alternative with visual state feedback. */
export const AnswerOption = ({ letter, text, state, onPress }: AnswerOptionProps) => {
  const s = stateStyles[state]
  return (
    <TouchableOpacity
      className={`border rounded-xl p-4 flex-row items-start gap-3 ${s.container}`}
      onPress={onPress}
      disabled={state === 'correct' || state === 'wrong'}
      accessibilityRole="button"
      accessibilityLabel={`Alternativa ${letter}: ${text}`}
    >
      <View className={`w-7 h-7 rounded-full items-center justify-center ${s.letter}`}>
        <Text className="text-xs font-bold">{letter}</Text>
      </View>
      <Text className={`flex-1 text-sm leading-5 ${s.text}`}>{text}</Text>
    </TouchableOpacity>
  )
}
```

- [ ] **Step 6: Write failing FeedbackOverlay test**

Create `tests/components/FeedbackOverlay.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react-native'
import { FeedbackOverlay } from '../../components/challenge/FeedbackOverlay'

const mockResult = {
  isCorrect: true,
  correctKey: 'A',
  xpEarned: 10,
  cognitiveImpact: [{ attribute: 'LOGICA' as const, delta: 2 }],
  explanation: null,
}

describe('FeedbackOverlay', () => {
  it('shows XP earned', () => {
    const { getByText } = render(
      <FeedbackOverlay result={mockResult} onNext={vi.fn()} visible />
    )
    expect(getByText('+10 XP')).toBeTruthy()
  })

  it('shows cognitive impact attribute', () => {
    const { getByText } = render(
      <FeedbackOverlay result={mockResult} onNext={vi.fn()} visible />
    )
    expect(getByText(/Lógica/)).toBeTruthy()
  })

  it('shows correct answer indicator', () => {
    const { getByText } = render(
      <FeedbackOverlay result={mockResult} onNext={vi.fn()} visible />
    )
    expect(getByText(/Correto/i)).toBeTruthy()
  })
})
```

- [ ] **Step 7: Create FeedbackOverlay**

Create `components/challenge/FeedbackOverlay.tsx`:
```tsx
import { useEffect, useRef } from 'react'
import { View, Text, Animated, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { AttemptResult } from '../../types/domain'

const ATTR_LABELS: Record<string, string> = {
  ENERGIA_NEURAL: 'Energia Neural',
  MEMORIA: 'Memória',
  LOGICA: 'Lógica',
  INTERPRETACAO: 'Interpretação',
  CIENCIAS: 'Ciências',
}

interface FeedbackOverlayProps {
  readonly result: AttemptResult
  readonly onNext: () => void
  readonly visible: boolean
}

/** Slide-up overlay shown after answering a question. Shows result, XP, and cognitive impact. */
export const FeedbackOverlay = ({ result, onNext, visible }: FeedbackOverlayProps) => {
  const translateY = useRef(new Animated.Value(300)).current

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }).start()
    } else {
      translateY.setValue(300)
    }
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View
      className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 rounded-t-2xl px-6 py-6 gap-4"
      style={{ transform: [{ translateY }] }}
    >
      <View className="flex-row items-center gap-3">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${result.isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          <Ionicons name={result.isCorrect ? 'checkmark' : 'close'} size={20} color={result.isCorrect ? '#10b981' : '#ef4444'} />
        </View>
        <View>
          <Text className={`font-bold text-base ${result.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {result.isCorrect ? 'Correto!' : 'Incorreto'}
          </Text>
          {!result.isCorrect && (
            <Text className="text-zinc-500 text-xs">Resposta: {result.correctKey}</Text>
          )}
        </View>
        <View className="ml-auto bg-indigo-500/20 px-3 py-1 rounded-full">
          <Text className="text-indigo-400 font-bold text-sm">+{result.xpEarned} XP</Text>
        </View>
      </View>

      {result.cognitiveImpact.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {result.cognitiveImpact.map((impact) => (
            <View key={impact.attribute} className="bg-zinc-800 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Text className="text-zinc-400 text-xs">+{impact.delta} {ATTR_LABELS[impact.attribute]}</Text>
            </View>
          ))}
        </View>
      )}

      {result.explanation && (
        <Text className="text-zinc-500 text-sm leading-5">{result.explanation}</Text>
      )}

      <TouchableOpacity
        className="bg-indigo-500 h-14 rounded-xl items-center justify-center"
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Próxima questão"
      >
        <Text className="text-white font-bold text-base">Próxima</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
```

- [ ] **Step 8: Run component tests — expect PASS**

```bash
npx vitest run tests/components/
```
Expected: PASS (6 tests)

- [ ] **Step 9: Commit**

```bash
git add cortex-app/components/challenge/ cortex-app/tests/components/
git commit -m "feat(cortex-app): add challenge components with tests"
```

---

## Task 13: Challenge & Result Screens

**Files:**
- Create: `cortex-app/app/(app)/desafio/index.tsx`
- Create: `cortex-app/app/(app)/desafio/resultado.tsx`

- [ ] **Step 1: Create Challenge session screen**

Create `app/(app)/desafio/index.tsx`:
```tsx
import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNextChallenge, submitAnswer, completeChallenge } from '../../../services/challenge.service'
import { SessionProgress } from '../../../components/challenge/SessionProgress'
import { QuestionCard } from '../../../components/challenge/QuestionCard'
import { AnswerOption } from '../../../components/challenge/AnswerOption'
import { FeedbackOverlay } from '../../../components/challenge/FeedbackOverlay'
import { Modal } from '../../../components/ui/Modal'
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../../lib/query-keys'
import type { AttemptResult, QuestionDTO } from '../../../types/domain'

export default function DesafioScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [sessionResults, setSessionResults] = useState<AttemptResult[]>([])

  const { data: session, isLoading, isError } = useQuery({
    queryKey: QueryKeys.challengeNext,
    queryFn: getNextChallenge,
    staleTime: 0,
  })

  const submitMutation = useMutation({
    mutationFn: (chosenKey: string) => {
      const question = session!.questions[currentIndex]!
      return submitAnswer({
        challengeId: session!.challengeId,
        questionId: question.id,
        chosenKey,
        consecutiveCorrect,
      })
    },
    onSuccess: (res) => {
      setResult(res)
      setShowFeedback(true)
      setSessionResults((prev) => [...prev, res])
      setConsecutiveCorrect(res.isCorrect ? consecutiveCorrect + 1 : 0)
    },
  })

  const handleConfirm = useCallback(() => {
    if (!selectedKey || submitMutation.isPending) return
    submitMutation.mutate(selectedKey)
  }, [selectedKey, submitMutation])

  const handleNext = useCallback(async () => {
    setShowFeedback(false)
    setSelectedKey(null)
    setResult(null)

    const isLast = currentIndex === (session?.questions.length ?? 0) - 1
    if (isLast) {
      await completeChallenge(session!.challengeId)
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard })
      queryClient.invalidateQueries({ queryKey: QueryKeys.brainCurrent })
      router.replace({ pathname: '/(app)/desafio/resultado', params: { results: JSON.stringify(sessionResults) } })
      return
    }
    setCurrentIndex((i) => i + 1)
  }, [currentIndex, session, sessionResults])

  if (isLoading) return (
    <View className="flex-1 bg-zinc-950 px-4 pt-14 gap-6">
      <SkeletonLoader height={8} />
      <SkeletonLoader height={120} />
      {[1, 2, 3, 4, 5].map((i) => <SkeletonLoader key={i} height={56} />)}
    </View>
  )

  if (isError || !session) return (
    <View className="flex-1 bg-zinc-950 items-center justify-center gap-4 px-6">
      <Text className="text-zinc-400 text-base text-center">Algo deu errado. Tente novamente.</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-indigo-500 font-semibold">Voltar</Text>
      </TouchableOpacity>
    </View>
  )

  const question: QuestionDTO = session.questions[currentIndex]!

  return (
    <View className="flex-1 bg-zinc-950">
      <SessionProgress
        current={currentIndex + 1}
        total={session.questions.length}
        onExit={() => setShowExitModal(true)}
      />

      <ScrollView className="flex-1" contentContainerClassName="px-4 py-6 gap-6">
        <QuestionCard question={question} />
        <View className="gap-3">
          {question.alternatives.map((alt) => {
            let state: 'idle' | 'selected' | 'correct' | 'wrong' = 'idle'
            if (showFeedback && result) {
              if (alt.key === result.correctKey) state = 'correct'
              else if (alt.key === selectedKey) state = 'wrong'
            } else if (alt.key === selectedKey) {
              state = 'selected'
            }
            return (
              <AnswerOption
                key={alt.key}
                letter={alt.key}
                text={alt.text}
                state={state}
                onPress={() => !showFeedback && setSelectedKey(alt.key)}
              />
            )
          })}
        </View>

        {selectedKey && !showFeedback && (
          <TouchableOpacity
            className={`bg-indigo-500 h-14 rounded-xl items-center justify-center ${submitMutation.isPending ? 'opacity-50' : ''}`}
            onPress={handleConfirm}
            disabled={submitMutation.isPending}
          >
            <Text className="text-white font-bold text-base">Confirmar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {result && (
        <FeedbackOverlay result={result} onNext={handleNext} visible={showFeedback} />
      )}

      <Modal
        visible={showExitModal}
        title="Sair do desafio?"
        message="Seu progresso nesta sessão será perdido."
        confirmLabel="Sair"
        cancelLabel="Continuar"
        onConfirm={() => router.back()}
        onCancel={() => setShowExitModal(false)}
      />
    </View>
  )
}
```

- [ ] **Step 2: Create Result screen**

Create `app/(app)/desafio/resultado.tsx`:
```tsx
import { View, Text, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import type { AttemptResult } from '../../../types/domain'

export default function ResultadoScreen() {
  const router = useRouter()
  const { results: raw } = useLocalSearchParams<{ results: string }>()
  const results: AttemptResult[] = raw ? JSON.parse(raw) : []

  const correct = results.filter((r) => r.isCorrect).length
  const totalXp = results.reduce((sum, r) => sum + r.xpEarned, 0)
  const pct = results.length > 0 ? Math.round((correct / results.length) * 100) : 0

  const impactMap: Record<string, number> = {}
  results.forEach((r) => r.cognitiveImpact.forEach(({ attribute, delta }) => {
    impactMap[attribute] = (impactMap[attribute] ?? 0) + delta
  }))

  const ATTR_LABELS: Record<string, string> = {
    ENERGIA_NEURAL: 'Energia Neural', MEMORIA: 'Memória', LOGICA: 'Lógica',
    INTERPRETACAO: 'Interpretação', CIENCIAS: 'Ciências',
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-6 py-16 gap-6">
      <Text className="text-zinc-100 text-2xl font-bold text-center">Sessão concluída</Text>

      <Card className="items-center gap-2">
        <Text className="text-indigo-400 text-5xl font-bold">+{totalXp}</Text>
        <Text className="text-zinc-500 text-sm">XP ganho nesta sessão</Text>
      </Card>

      <View className="flex-row gap-3">
        <Card className="flex-1 items-center gap-1">
          <Text className="text-zinc-100 text-2xl font-bold">{correct}/{results.length}</Text>
          <Text className="text-zinc-500 text-xs">corretas</Text>
        </Card>
        <Card className="flex-1 items-center gap-1">
          <Text className="text-zinc-100 text-2xl font-bold">{pct}%</Text>
          <Text className="text-zinc-500 text-xs">aproveitamento</Text>
        </Card>
      </View>

      {Object.entries(impactMap).length > 0 && (
        <Card className="gap-3">
          <Text className="text-zinc-400 text-sm font-medium">Evolução cognitiva</Text>
          {Object.entries(impactMap).map(([attr, delta]) => (
            <View key={attr} className="flex-row justify-between">
              <Text className="text-zinc-300 text-sm">{ATTR_LABELS[attr] ?? attr}</Text>
              <Text className="text-indigo-400 text-sm font-semibold">+{delta}</Text>
            </View>
          ))}
        </Card>
      )}

      <Button label="Voltar ao início" onPress={() => router.replace('/(app)')} />
      <Button label="Nova sessão" onPress={() => router.replace('/(app)/desafio')} variant="secondary" />
    </ScrollView>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add cortex-app/app/(app)/desafio/
git commit -m "feat(cortex-app): add challenge and result screens"
```

---

## Task 14: Progress Components & Screen

**Files:**
- Create: `cortex-app/components/progress/EstimatedScoreChart.tsx`
- Create: `cortex-app/components/progress/CognitiveAttributeCard.tsx`
- Create: `cortex-app/components/progress/AchievementGrid.tsx`
- Create: `cortex-app/app/(app)/progresso.tsx`

- [ ] **Step 1: Create EstimatedScoreChart**

Create `components/progress/EstimatedScoreChart.tsx`:
```tsx
import { View, Text, Dimensions } from 'react-native'
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory-native'
import type { BrainMetrics } from '../../types/domain'

const { width } = Dimensions.get('window')

interface EstimatedScoreChartProps {
  readonly snapshots: readonly BrainMetrics[]
}

/** Line chart of estimated ENEM score over time. */
export const EstimatedScoreChart = ({ snapshots }: EstimatedScoreChartProps) => {
  if (snapshots.length < 2) return (
    <View className="h-40 items-center justify-center">
      <Text className="text-zinc-600 text-sm">Dados insuficientes para o gráfico.</Text>
    </View>
  )

  const data = snapshots.map((s, i) => ({ x: i + 1, y: s.estimatedScore }))

  return (
    <VictoryChart width={width - 48} height={180} padding={{ top: 10, bottom: 30, left: 40, right: 10 }}>
      <VictoryAxis style={{ axis: { stroke: '#27272a' }, tickLabels: { fill: '#71717a', fontSize: 10 } }} />
      <VictoryAxis dependentAxis style={{ axis: { stroke: '#27272a' }, tickLabels: { fill: '#71717a', fontSize: 10 } }} />
      <VictoryLine data={data} style={{ data: { stroke: '#6366f1', strokeWidth: 2 } }} />
    </VictoryChart>
  )
}
```

- [ ] **Step 2: Create CognitiveAttributeCard**

Create `components/progress/CognitiveAttributeCard.tsx`:
```tsx
import { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AttributeBar } from '../brain-status/AttributeBar'
import type { CognitiveAttribute } from '../../types/domain'

interface CognitiveAttributeCardProps {
  readonly attribute: CognitiveAttribute
  readonly score: number
  readonly totalAnswered: number
  readonly correctAnswered: number
}

/** Expandable card showing attribute score and answer stats. */
export const CognitiveAttributeCard = ({ attribute, score, totalAnswered, correctAnswered }: CognitiveAttributeCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswered / totalAnswered) * 100) : 0

  return (
    <View className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <TouchableOpacity
        className="p-4 flex-row items-center gap-3"
        onPress={() => setExpanded((e) => !e)}
        accessibilityRole="button"
      >
        <View className="flex-1">
          <AttributeBar attribute={attribute} score={score} />
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#71717a" />
      </TouchableOpacity>
      {expanded && (
        <View className="px-4 pb-4 gap-2 border-t border-zinc-800">
          <View className="flex-row justify-between pt-3">
            <Text className="text-zinc-500 text-sm">Questões respondidas</Text>
            <Text className="text-zinc-300 text-sm font-semibold">{totalAnswered}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-zinc-500 text-sm">Taxa de acerto</Text>
            <Text className="text-zinc-300 text-sm font-semibold">{accuracy}%</Text>
          </View>
        </View>
      )}
    </View>
  )
}
```

- [ ] **Step 3: Create AchievementGrid**

Create `components/progress/AchievementGrid.tsx`:
```tsx
import { View, Text } from 'react-native'
import type { UnlockedAchievement, LockedAchievement } from '../../types/domain'

interface AchievementGridProps {
  readonly unlocked: readonly UnlockedAchievement[]
  readonly locked: readonly LockedAchievement[]
}

/** Grid of achievement badges (unlocked + locked). */
export const AchievementGrid = ({ unlocked, locked }: AchievementGridProps) => (
  <View className="gap-3">
    {unlocked.length > 0 && (
      <>
        <Text className="text-zinc-400 text-sm font-medium">Conquistadas</Text>
        <View className="flex-row flex-wrap gap-3">
          {unlocked.map((a) => (
            <View key={a.id} className="bg-zinc-900 border border-indigo-500/30 rounded-xl p-3 items-center gap-1 w-24">
              <Text className="text-2xl">{a.icon}</Text>
              <Text className="text-zinc-100 text-xs font-medium text-center">{a.name}</Text>
            </View>
          ))}
        </View>
      </>
    )}
    {locked.length > 0 && (
      <>
        <Text className="text-zinc-500 text-sm font-medium mt-2">Bloqueadas</Text>
        <View className="flex-row flex-wrap gap-3">
          {locked.map((a) => (
            <View key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 items-center gap-1 w-24 opacity-50">
              <Text className="text-2xl grayscale">{a.icon}</Text>
              <Text className="text-zinc-500 text-xs text-center">{a.name}</Text>
            </View>
          ))}
        </View>
      </>
    )}
  </View>
)
```

- [ ] **Step 4: Create Progresso screen**

Create `app/(app)/progresso.tsx`:
```tsx
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { getBrainHistory, getBrainCurrent, getAchievements } from '../../services/progress.service'
import { EstimatedScoreChart } from '../../components/progress/EstimatedScoreChart'
import { CognitiveAttributeCard } from '../../components/progress/CognitiveAttributeCard'
import { AchievementGrid } from '../../components/progress/AchievementGrid'
import { Card } from '../../components/ui/Card'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../lib/query-keys'

export default function ProgressoScreen() {
  const history = useQuery({ queryKey: QueryKeys.brainHistory(30), queryFn: () => getBrainHistory(30), staleTime: 60_000 })
  const current = useQuery({ queryKey: QueryKeys.brainCurrent, queryFn: getBrainCurrent, staleTime: 60_000 })
  const achievements = useQuery({ queryKey: QueryKeys.achievements, queryFn: getAchievements, staleTime: 60_000 })

  const isLoading = history.isLoading || current.isLoading || achievements.isLoading

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-4 pt-16 pb-8 gap-6">
      <Text className="text-zinc-100 text-xl font-bold">Progresso</Text>

      {/* Score Chart */}
      <Card className="gap-3">
        <Text className="text-zinc-400 text-sm font-medium">Nota Estimada (30 dias)</Text>
        {isLoading ? <SkeletonLoader height={180} /> : (
          <EstimatedScoreChart snapshots={history.data?.snapshots ?? []} />
        )}
      </Card>

      {/* Cognitive Attributes */}
      <View className="gap-3">
        <Text className="text-zinc-400 text-sm font-medium">Atributos Cognitivos</Text>
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => <SkeletonLoader key={i} height={56} />)
        ) : current.data ? (
          <>
            <CognitiveAttributeCard attribute="ENERGIA_NEURAL" score={current.data.energiaNeuralScore} totalAnswered={0} correctAnswered={0} />
            <CognitiveAttributeCard attribute="MEMORIA" score={current.data.memoriaScore} totalAnswered={0} correctAnswered={0} />
            <CognitiveAttributeCard attribute="LOGICA" score={current.data.logicaScore} totalAnswered={0} correctAnswered={0} />
            <CognitiveAttributeCard attribute="INTERPRETACAO" score={current.data.interpretacaoScore} totalAnswered={0} correctAnswered={0} />
            <CognitiveAttributeCard attribute="CIENCIAS" score={current.data.cienciasScore} totalAnswered={0} correctAnswered={0} />
          </>
        ) : null}
      </View>

      {/* Achievements */}
      <View className="gap-3">
        <Text className="text-zinc-400 text-sm font-medium">Conquistas</Text>
        {isLoading ? <SkeletonLoader height={80} /> : achievements.data ? (
          <AchievementGrid unlocked={achievements.data.unlocked} locked={achievements.data.locked} />
        ) : null}
      </View>
    </ScrollView>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add cortex-app/components/progress/ cortex-app/app/(app)/progresso.tsx
git commit -m "feat(cortex-app): add progress components and Progresso screen"
```

---

## Task 15: Perfil Screen

**Files:**
- Create: `cortex-app/app/(app)/perfil.tsx`

- [ ] **Step 1: Create Perfil screen**

Create `app/(app)/perfil.tsx`:
```tsx
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMe } from '../../services/user.service'
import { logout } from '../../services/auth.service'
import { useAuthStore } from '../../stores/auth.store'
import { Card } from '../../components/ui/Card'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../lib/query-keys'

export default function PerfilScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const { data: user, isLoading } = useQuery({
    queryKey: QueryKeys.userMe,
    queryFn: getMe,
    staleTime: 5 * 60_000,
  })

  const logoutMutation = useMutation({
    mutationFn: async () => { await logout(); await clearAuth() },
    onSuccess: () => { queryClient.clear(); router.replace('/(auth)/login') },
  })

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => logoutMutation.mutate() },
    ])
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-4 pt-16 pb-8 gap-6">
      <Text className="text-zinc-100 text-xl font-bold">Perfil</Text>

      {isLoading ? (
        <Card className="gap-3">
          <SkeletonLoader height={20} width="50%" />
          <SkeletonLoader height={16} width="70%" />
        </Card>
      ) : user ? (
        <Card className="gap-3">
          <View className="w-14 h-14 rounded-full bg-indigo-500/20 items-center justify-center">
            <Text className="text-indigo-400 text-xl font-bold">{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text className="text-zinc-100 text-lg font-bold">{user.name}</Text>
          <Text className="text-zinc-500 text-sm">{user.email}</Text>
        </Card>
      ) : null}

      {user && (
        <View className="flex-row gap-3">
          <Card className="flex-1 items-center gap-1">
            <Text className="text-zinc-100 text-2xl font-bold">Nv {user.level}</Text>
            <Text className="text-zinc-500 text-xs">Nível</Text>
          </Card>
          <Card className="flex-1 items-center gap-1">
            <Text className="text-zinc-100 text-2xl font-bold">{user.xp}</Text>
            <Text className="text-zinc-500 text-xs">XP total</Text>
          </Card>
          <Card className="flex-1 items-center gap-1">
            <Text className="text-zinc-100 text-2xl font-bold">{user.streakDays}</Text>
            <Text className="text-zinc-500 text-xs">dias seguidos</Text>
          </Card>
        </View>
      )}

      <TouchableOpacity
        className="bg-zinc-900 border border-zinc-800 rounded-xl h-14 items-center justify-center"
        onPress={handleLogout}
        disabled={logoutMutation.isPending}
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
      >
        <Text className="text-red-400 font-semibold">
          {logoutMutation.isPending ? 'Saindo...' : 'Sair da conta'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add cortex-app/app/(app)/perfil.tsx
git commit -m "feat(cortex-app): add Perfil screen"
```

---

## Task 16: Final Verification

- [ ] **Step 1: Run all tests**

```bash
cd cortex-app && npx vitest run
```
Expected: All test suites pass (green).

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Start dev server and verify**

```bash
npx expo start
```
Open in iOS Simulator or Android Emulator. Verify:
- Splash → Onboarding (new user)
- Register → Onboarding → Home
- Login → Home
- Home: Brain Status, streak, stats, CTA
- Desafio: questões, feedback, resultado
- Progresso: gráfico, atributos, conquistas
- Perfil: dados, logout

- [ ] **Step 4: Final commit**

```bash
git add cortex-app/
git commit -m "feat(cortex-app): complete MVP mobile app"
```
