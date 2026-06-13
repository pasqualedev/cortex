# Cortex Mobile Wow UX Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Cortex mobile app with animated gamification elements: a redesigned Home with a cognitive score ring + XP bar, a 3-step animated result screen (celebration → score → streak), and an expressive FeedbackOverlay during challenges.

**Architecture:** New reusable `AnimatedProgressBar` and `CountUp` UI primitives power all animated bars and counters. Two lightweight Zustand stores (`resultStore`, `dailyStore`) carry session data across screens. The 3-step result flow is self-contained in `components/resultado/`. The Home redesign replaces `BrainStatus` inline with an SVG ring component.

**Tech Stack:** React Native + Expo, `react-native-reanimated` 4.3.1 (already installed), `react-native-svg` 15.15.4 (already installed), `react-native-confetti-cannon` (new), Zustand, `expo-secure-store`, Vitest.

---

## File Map

**New files:**
- `lib/xp.ts` — XP/level threshold utilities
- `stores/result.store.ts` — transient session result data (xp, accuracy, combo, streak)
- `stores/daily.store.ts` — today's completed sessions count (persisted via SecureStore)
- `lib/storage-keys.ts` — add `DAILY_SESSIONS` key (modify existing)
- `components/ui/AnimatedProgressBar.tsx` — animated progress bar primitive
- `components/ui/CountUp.tsx` — animated number counter primitive
- `components/resultado/StepCelebration.tsx` — result passo 1
- `components/resultado/StepScoreXP.tsx` — result passo 2
- `components/resultado/StepStreak.tsx` — result passo 3
- `tests/lib/xp.test.ts`
- `tests/stores/result.store.test.ts`
- `tests/stores/daily.store.test.ts`

**Modified files:**
- `lib/theme.ts` — add `amber500`, `orange500`, `orange500_10`
- `components/brain-status/BrainStatus.tsx` — add animated SVG score ring
- `components/challenge/FeedbackOverlay.tsx` — animated icon, XP entry, combo badge
- `app/(app)/desafio/index.tsx` — accumulate session stats + save to resultStore before complete
- `app/(app)/desafio/resultado.tsx` — replaced by 3-step orchestrator
- `app/(app)/index.tsx` — Home redesigned with 4 blocks

---

## Task 1: Install confetti package + extend theme colors

**Files:**
- Modify: `lib/theme.ts`

- [ ] **Step 1: Install react-native-confetti-cannon**

```bash
cd cortex-app && npm install react-native-confetti-cannon
```

Expected: package added to `node_modules`, `package.json` updated.

- [ ] **Step 2: Add missing colors to theme**

In `lib/theme.ts`, add after the `// Violet` block:

```ts
  // Amber (combo)
  amber500: '#f59e0b',
  amber500_10: 'rgba(245,158,11,0.1)',
  // Orange (streak)
  orange500: '#f97316',
  orange500_10: 'rgba(249,115,22,0.1)',
```

- [ ] **Step 3: Add DAILY_SESSIONS key to storage-keys**

In `lib/storage-keys.ts`, add:

```ts
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'cortex_access_token',
  REFRESH_TOKEN: 'cortex_refresh_token',
  DAILY_SESSIONS: 'cortex_daily_sessions_v1',
} as const
```

- [ ] **Step 4: Commit**

```bash
git add cortex-app/package.json cortex-app/package-lock.json cortex-app/lib/theme.ts cortex-app/lib/storage-keys.ts
git commit -m "feat: install confetti-cannon, extend theme with amber/orange, add daily key"
```

---

## Task 2: lib/xp.ts — XP and level utilities

**Files:**
- Create: `cortex-app/lib/xp.ts`
- Create: `cortex-app/tests/lib/xp.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `cortex-app/tests/lib/xp.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { xpForLevel, xpForNextLevel, xpProgress } from '../../lib/xp'

describe('xpForLevel', () => {
  it('level 1 starts at 0 XP', () => {
    expect(xpForLevel(1)).toBe(0)
  })
  it('level 4 starts at 500 XP', () => {
    expect(xpForLevel(4)).toBe(500)
  })
  it('level 10 starts at 12000 XP', () => {
    expect(xpForLevel(10)).toBe(12000)
  })
})

describe('xpForNextLevel', () => {
  it('level 1 needs 100 XP to reach level 2', () => {
    expect(xpForNextLevel(1)).toBe(100)
  })
  it('level 4 needs 1000 XP to reach level 5', () => {
    expect(xpForNextLevel(4)).toBe(1000)
  })
  it('level 10 (max) returns same threshold', () => {
    expect(xpForNextLevel(10)).toBe(12000)
  })
})

describe('xpProgress', () => {
  it('0 XP at level 1 = 0% progress', () => {
    expect(xpProgress(0, 1)).toBeCloseTo(0)
  })
  it('50 XP at level 1 = 50% progress toward level 2 (threshold 100)', () => {
    expect(xpProgress(50, 1)).toBeCloseTo(0.5)
  })
  it('750 XP at level 4 = 50% progress toward level 5 (500-1000 range)', () => {
    expect(xpProgress(750, 4)).toBeCloseTo(0.5)
  })
  it('clamps to 1 when at or above next threshold', () => {
    expect(xpProgress(1000, 4)).toBeCloseTo(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd cortex-app && npx vitest run tests/lib/xp.test.ts
```

Expected: FAIL — `Cannot find module '../../lib/xp'`

- [ ] **Step 3: Implement lib/xp.ts**

Create `cortex-app/lib/xp.ts`:

```ts
/** XP thresholds matching the backend answer.service.ts calculateLevelFromXP. */
const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000] as const

/** XP required to be at the start of `level`. */
export const xpForLevel = (level: number): number =>
  XP_THRESHOLDS[level - 1] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1]!

/** XP required to reach `level + 1`. */
export const xpForNextLevel = (level: number): number =>
  XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1]!

/** Progress ratio (0–1) within the current level. */
export const xpProgress = (xp: number, level: number): number => {
  const current = xpForLevel(level)
  const next = xpForNextLevel(level)
  if (next === current) return 1
  return Math.min(1, (xp - current) / (next - current))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd cortex-app && npx vitest run tests/lib/xp.test.ts
```

Expected: 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add cortex-app/lib/xp.ts cortex-app/tests/lib/xp.test.ts
git commit -m "feat: add XP/level utility functions with tests"
```

---

## Task 3: stores/result.store.ts — transient session result

**Files:**
- Create: `cortex-app/stores/result.store.ts`
- Create: `cortex-app/tests/stores/result.store.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `cortex-app/tests/stores/result.store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useResultStore } from '../../stores/result.store'

const mockResult = {
  xpEarned: 240,
  correctCount: 8,
  totalCount: 10,
  maxCombo: 3,
  streakDays: 7,
}

describe('useResultStore', () => {
  beforeEach(() => {
    useResultStore.setState({ ...mockResult, xpEarned: 0, correctCount: 0, totalCount: 0, maxCombo: 0, streakDays: 0 })
  })

  it('starts with zeroed data', () => {
    const s = useResultStore.getState()
    expect(s.xpEarned).toBe(0)
    expect(s.correctCount).toBe(0)
  })

  it('setResult updates all fields', () => {
    useResultStore.getState().setResult(mockResult)
    const s = useResultStore.getState()
    expect(s.xpEarned).toBe(240)
    expect(s.correctCount).toBe(8)
    expect(s.totalCount).toBe(10)
    expect(s.maxCombo).toBe(3)
    expect(s.streakDays).toBe(7)
  })

  it('reset zeroes all fields', () => {
    useResultStore.getState().setResult(mockResult)
    useResultStore.getState().reset()
    const s = useResultStore.getState()
    expect(s.xpEarned).toBe(0)
    expect(s.correctCount).toBe(0)
    expect(s.maxCombo).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd cortex-app && npx vitest run tests/stores/result.store.test.ts
```

Expected: FAIL — `Cannot find module '../../stores/result.store'`

- [ ] **Step 3: Implement result.store.ts**

Create `cortex-app/stores/result.store.ts`:

```ts
import { create } from 'zustand'

interface ResultData {
  readonly xpEarned: number
  readonly correctCount: number
  readonly totalCount: number
  readonly maxCombo: number
  readonly streakDays: number
}

interface ResultState extends ResultData {
  setResult: (data: ResultData) => void
  reset: () => void
}

const INITIAL: ResultData = {
  xpEarned: 0,
  correctCount: 0,
  totalCount: 0,
  maxCombo: 0,
  streakDays: 0,
}

/** Transient store for session result data. Populated before navigating to resultado screen. */
export const useResultStore = create<ResultState>((set) => ({
  ...INITIAL,
  setResult: (data) => set(data),
  reset: () => set(INITIAL),
}))
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd cortex-app && npx vitest run tests/stores/result.store.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add cortex-app/stores/result.store.ts cortex-app/tests/stores/result.store.test.ts
git commit -m "feat: add result store for transient session data"
```

---

## Task 4: stores/daily.store.ts — daily sessions tracking

**Files:**
- Create: `cortex-app/stores/daily.store.ts`
- Create: `cortex-app/tests/stores/daily.store.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `cortex-app/tests/stores/daily.store.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
}))

import * as SecureStore from 'expo-secure-store'
import { useDailyStore } from '../../stores/daily.store'

const TODAY = '2026-06-13'

describe('useDailyStore', () => {
  beforeEach(() => {
    useDailyStore.setState({ date: '', count: 0, isReady: false })
    vi.clearAllMocks()
  })

  it('starts with count 0 and isReady false', () => {
    const s = useDailyStore.getState()
    expect(s.count).toBe(0)
    expect(s.isReady).toBe(false)
  })

  it('hydrate loads persisted count when date matches today', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(
      JSON.stringify({ date: TODAY, count: 2 })
    )
    await useDailyStore.getState().hydrate(TODAY)
    const s = useDailyStore.getState()
    expect(s.count).toBe(2)
    expect(s.isReady).toBe(true)
  })

  it('hydrate resets count when date does not match today', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(
      JSON.stringify({ date: '2026-06-12', count: 3 })
    )
    await useDailyStore.getState().hydrate(TODAY)
    const s = useDailyStore.getState()
    expect(s.count).toBe(0)
    expect(s.isReady).toBe(true)
  })

  it('hydrate handles null storage (first launch)', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(null)
    await useDailyStore.getState().hydrate(TODAY)
    const s = useDailyStore.getState()
    expect(s.count).toBe(0)
    expect(s.isReady).toBe(true)
  })

  it('incrementToday increases count and persists', async () => {
    useDailyStore.setState({ date: TODAY, count: 1, isReady: true })
    await useDailyStore.getState().incrementToday(TODAY)
    expect(useDailyStore.getState().count).toBe(2)
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'cortex_daily_sessions_v1',
      JSON.stringify({ date: TODAY, count: 2 })
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd cortex-app && npx vitest run tests/stores/daily.store.test.ts
```

Expected: FAIL — `Cannot find module '../../stores/daily.store'`

- [ ] **Step 3: Implement daily.store.ts**

Create `cortex-app/stores/daily.store.ts`:

```ts
import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from '../lib/storage-keys'

interface DailyState {
  readonly date: string
  readonly count: number
  readonly isReady: boolean
  hydrate: (today?: string) => Promise<void>
  incrementToday: (today?: string) => Promise<void>
}

const todayISO = () => new Date().toISOString().slice(0, 10)

/** Tracks how many challenge sessions were completed today. Resets automatically on a new day. */
export const useDailyStore = create<DailyState>((set, get) => ({
  date: '',
  count: 0,
  isReady: false,

  hydrate: async (today = todayISO()) => {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.DAILY_SESSIONS)
    if (!raw) {
      set({ date: today, count: 0, isReady: true })
      return
    }
    const parsed = JSON.parse(raw) as { date: string; count: number }
    if (parsed.date !== today) {
      set({ date: today, count: 0, isReady: true })
    } else {
      set({ date: today, count: parsed.count, isReady: true })
    }
  },

  incrementToday: async (today = todayISO()) => {
    const newCount = get().count + 1
    set({ date: today, count: newCount })
    await SecureStore.setItemAsync(
      STORAGE_KEYS.DAILY_SESSIONS,
      JSON.stringify({ date: today, count: newCount })
    )
  },
}))
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd cortex-app && npx vitest run tests/stores/daily.store.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add cortex-app/stores/daily.store.ts cortex-app/tests/stores/daily.store.test.ts
git commit -m "feat: add daily store for per-day session count with SecureStore persistence"
```

---

## Task 5: AnimatedProgressBar component

**Files:**
- Create: `cortex-app/components/ui/AnimatedProgressBar.tsx`

- [ ] **Step 1: Create AnimatedProgressBar**

Create `cortex-app/components/ui/AnimatedProgressBar.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { colors, radius } from '../../lib/theme'

interface AnimatedProgressBarProps {
  /** 0–100 */
  readonly value: number
  readonly color: string
  /** Animation duration in ms */
  readonly duration?: number
  /** Delay before animation starts in ms */
  readonly delay?: number
  readonly height?: number
}

/**
 * Progress bar that animates from 0 to `value` on mount.
 * Uses onLayout to measure container width for accurate pixel animation.
 */
export const AnimatedProgressBar = ({
  value,
  color,
  duration = 600,
  delay = 0,
  height = 8,
}: AnimatedProgressBarProps) => {
  const [containerWidth, setContainerWidth] = useState(0)
  const progress = useSharedValue(0)

  useEffect(() => {
    if (containerWidth === 0) return
    progress.value = withDelay(
      delay,
      withTiming((value / 100) * containerWidth, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    )
  }, [containerWidth, value, delay, duration])

  const animatedStyle = useAnimatedStyle(() => ({
    width: progress.value,
  }))

  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, height, borderRadius: height / 2 },
          animatedStyle,
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.bg800,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add cortex-app/components/ui/AnimatedProgressBar.tsx
git commit -m "feat: add AnimatedProgressBar component with Reanimated"
```

---

## Task 6: CountUp component

**Files:**
- Create: `cortex-app/components/ui/CountUp.tsx`

- [ ] **Step 1: Create CountUp**

Create `cortex-app/components/ui/CountUp.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { Text, StyleSheet } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'

interface CountUpProps {
  /** Target number to count up to */
  readonly to: number
  /** Total animation duration in ms */
  readonly duration?: number
  /** Delay before starting in ms */
  readonly delay?: number
  /** Text appended after the number (e.g. "%" or " dias") */
  readonly suffix?: string
  /** Text prepended before the number (e.g. "+") */
  readonly prefix?: string
  readonly style?: StyleProp<TextStyle>
}

/**
 * Animates a number counting from 0 to `to` over `duration` ms.
 * Uses setInterval for simplicity — no Reanimated required.
 */
export const CountUp = ({
  to,
  duration = 800,
  delay = 0,
  suffix = '',
  prefix = '',
  style,
}: CountUpProps) => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const STEPS = 40
    const intervalMs = duration / STEPS
    const increment = to / STEPS
    let current = 0

    const start = () => {
      const timer = setInterval(() => {
        current += increment
        if (current >= to) {
          setValue(to)
          clearInterval(timer)
        } else {
          setValue(Math.floor(current))
        }
      }, intervalMs)
      return timer
    }

    if (delay > 0) {
      const delayTimer = setTimeout(() => start(), delay)
      return () => clearTimeout(delayTimer)
    }

    const timer = start()
    return () => clearInterval(timer)
  }, [to, duration, delay])

  return (
    <Text style={style}>
      {prefix}{value}{suffix}
    </Text>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add cortex-app/components/ui/CountUp.tsx
git commit -m "feat: add CountUp animated number component"
```

---

## Task 7: StepCelebration — result passo 1

**Files:**
- Create: `cortex-app/components/resultado/StepCelebration.tsx`

- [ ] **Step 1: Create StepCelebration**

Create `cortex-app/components/resultado/StepCelebration.tsx`:

```tsx
import { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import ConfettiCannon from 'react-native-confetti-cannon'
import { colors, font, spacing } from '../../lib/theme'

interface StepCelebrationProps {
  readonly totalCount: number
  readonly onAdvance: () => void
}

/**
 * Result step 1: full-screen celebration with confetti, spring emoji entry,
 * and auto-advance after 2.5s (or on tap).
 */
export const StepCelebration = ({ totalCount, onAdvance }: StepCelebrationProps) => {
  const { width } = useWindowDimensions()
  const translateY = useSharedValue(80)
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 })
    translateY.value = withSpring(0, { damping: 14, stiffness: 120 })

    const timer = setTimeout(onAdvance, 2500)
    return () => clearTimeout(timer)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  return (
    <TouchableOpacity style={styles.container} onPress={onAdvance} activeOpacity={1}>
      <ConfettiCannon
        count={80}
        origin={{ x: width / 2, y: -10 }}
        autoStart
        fadeOut
        colors={['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#818cf8']}
      />
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.emoji}>🧠</Text>
        <Text style={styles.title}>Desafio Concluído!</Text>
        <Text style={styles.subtitle}>{totalCount} questões respondidas</Text>
        <Text style={styles.hint}>Toque para continuar</Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg950,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: spacing[3],
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing[2],
  },
  title: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text500,
    fontSize: font.sm,
    textAlign: 'center',
  },
  hint: {
    color: colors.indigo400,
    fontSize: font.xs,
    marginTop: spacing[4],
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add cortex-app/components/resultado/StepCelebration.tsx
git commit -m "feat: add StepCelebration with confetti and spring animation"
```

---

## Task 8: StepScoreXP — result passo 2

**Files:**
- Create: `cortex-app/components/resultado/StepScoreXP.tsx`

- [ ] **Step 1: Create StepScoreXP**

Create `cortex-app/components/resultado/StepScoreXP.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'
import { AnimatedProgressBar } from '../ui/AnimatedProgressBar'
import { CountUp } from '../ui/CountUp'
import { Button } from '../ui/Button'
import { colors, font, spacing, radius } from '../../lib/theme'

interface StepScoreXPProps {
  readonly xpEarned: number
  readonly correctCount: number
  readonly totalCount: number
  readonly maxCombo: number
  readonly onAdvance: () => void
}

/**
 * Result step 2: animated bars for precision, XP, and max combo.
 * Each bar appears with a 300ms stagger. "Continuar" button fades in at 650ms.
 */
export const StepScoreXP = ({
  xpEarned,
  correctCount,
  totalCount,
  maxCombo,
  onAdvance,
}: StepScoreXPProps) => {
  const [showButton, setShowButton] = useState(false)
  const precision = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const comboPercent = Math.min(100, (maxCombo / 5) * 100)

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 650)
    return () => clearTimeout(timer)
  }, [])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.Text entering={FadeInDown.duration(300)} style={styles.title}>
          Veja seu desempenho
        </Animated.Text>

        <View style={styles.barsContainer}>
          {/* Bar 1 — Precisão (delay 0ms) */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.barBlock}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>Precisão</Text>
              <CountUp to={precision} suffix="%" style={styles.barValue} />
            </View>
            <AnimatedProgressBar
              value={precision}
              color={colors.indigo500}
              duration={600}
              delay={0}
            />
            <Text style={styles.barSub}>{correctCount}/{totalCount} acertos</Text>
          </Animated.View>

          {/* Bar 2 — XP ganho (delay 300ms) */}
          <Animated.View entering={FadeInDown.delay(400).duration(300)} style={styles.barBlock}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>XP Ganho</Text>
              <CountUp to={xpEarned} prefix="+" style={[styles.barValue, { color: colors.violet500 }]} />
            </View>
            <AnimatedProgressBar
              value={Math.min(100, (xpEarned / 500) * 100)}
              color={colors.violet500}
              duration={600}
              delay={300}
            />
          </Animated.View>

          {/* Bar 3 — Combo (delay 600ms) */}
          <Animated.View entering={FadeInDown.delay(700).duration(300)} style={styles.barBlock}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>Combo Máximo</Text>
              <CountUp
                to={maxCombo}
                prefix="×"
                style={[styles.barValue, { color: colors.amber500 }]}
              />
            </View>
            <AnimatedProgressBar
              value={comboPercent}
              color={colors.amber500}
              duration={600}
              delay={600}
            />
          </Animated.View>
        </View>

        {showButton ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.buttonContainer}>
            <Button label="Continuar" onPress={onAdvance} variant="primary" />
          </Animated.View>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    gap: spacing[8],
    justifyContent: 'center',
  },
  title: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  barsContainer: {
    gap: spacing[6],
  },
  barBlock: {
    gap: spacing[2],
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    color: colors.text400,
    fontSize: font.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  barValue: {
    color: colors.text100,
    fontSize: font.lg,
    fontWeight: 'bold',
  },
  barSub: {
    color: colors.text600,
    fontSize: font.xs,
  },
  buttonContainer: {
    marginTop: spacing[4],
  },
})
```

- [ ] **Step 2: Add `amber500` type to theme export** (verify `colors.amber500` is accessible after Task 1 — if Task 1 was completed this is already done)

- [ ] **Step 3: Commit**

```bash
git add cortex-app/components/resultado/StepScoreXP.tsx
git commit -m "feat: add StepScoreXP with staggered animated bars"
```

---

## Task 9: StepStreak — result passo 3

**Files:**
- Create: `cortex-app/components/resultado/StepStreak.tsx`

- [ ] **Step 1: Create StepStreak**

Create `cortex-app/components/resultado/StepStreak.tsx`:

```tsx
import { useEffect } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated'
import { CountUp } from '../ui/CountUp'
import { Button } from '../ui/Button'
import { colors, font, spacing, radius } from '../../lib/theme'

interface StepStreakProps {
  readonly streakDays: number
  readonly onHome: () => void
  readonly onNewChallenge: () => void
}

/**
 * Result step 3: streak celebration with flame pulse, day count-up,
 * and cascading 7-day mini calendar.
 */
export const StepStreak = ({ streakDays, onHome, onNewChallenge }: StepStreakProps) => {
  const scale = useSharedValue(0.5)
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 })
    scale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 200 }),
      withTiming(1.0, { duration: 150 }),
      withTiming(1.2, { duration: 150 }),
      withTiming(1.0, { duration: 150 }),
    )
  }, [])

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.Text style={[styles.flameEmoji, flameStyle]}>🔥</Animated.Text>

        <View style={styles.countContainer}>
          <CountUp
            to={streakDays}
            duration={800}
            style={styles.streakNumber}
          />
          <Text style={styles.streakLabel}>
            {streakDays === 1 ? 'dia de sequência' : 'dias de sequência'}
          </Text>
        </View>

        <View style={styles.calendar}>
          {Array.from({ length: 7 }).map((_, i) => {
            const isActive = i < streakDays
            const isToday = i === Math.min(streakDays - 1, 6)
            return (
              <Animated.View
                key={i}
                entering={FadeIn.delay(i * 80).duration(200)}
                style={[
                  styles.calendarCell,
                  isActive ? styles.calendarCellActive : styles.calendarCellInactive,
                  isToday ? styles.calendarCellToday : null,
                ]}
              >
                <Text style={styles.calendarEmoji}>{isActive ? '🔥' : '·'}</Text>
              </Animated.View>
            )
          })}
        </View>

        {streakDays > 0 ? (
          <Animated.Text entering={FadeIn.delay(700).duration(300)} style={styles.motivational}>
            Continue amanhã para não perder!
          </Animated.Text>
        ) : null}

        <View style={styles.buttons}>
          <Button label="Voltar para Home" onPress={onHome} variant="primary" />
          <Button label="Novo Desafio" onPress={onNewChallenge} variant="secondary" />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    gap: spacing[6],
  },
  flameEmoji: {
    fontSize: 72,
  },
  countContainer: {
    alignItems: 'center',
    gap: spacing[1],
  },
  streakNumber: {
    color: colors.orange500,
    fontSize: font['4xl'],
    fontWeight: 'bold',
    lineHeight: font['4xl'] * 1.1,
  },
  streakLabel: {
    color: colors.text400,
    fontSize: font.base,
  },
  calendar: {
    flexDirection: 'row',
    gap: spacing[1.5],
  },
  calendarCell: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCellActive: {
    backgroundColor: colors.orange500_10,
  },
  calendarCellInactive: {
    backgroundColor: colors.bg800,
  },
  calendarCellToday: {
    borderWidth: 1,
    borderColor: colors.orange500,
  },
  calendarEmoji: {
    fontSize: font.sm,
  },
  motivational: {
    color: colors.text500,
    fontSize: font.sm,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: spacing[3],
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add cortex-app/components/resultado/StepStreak.tsx
git commit -m "feat: add StepStreak with flame pulse and cascading calendar"
```

---

## Task 10: resultado.tsx — 3-step orchestrator

**Files:**
- Modify: `cortex-app/app/(app)/desafio/resultado.tsx`

- [ ] **Step 1: Replace resultado.tsx with 3-step orchestrator**

Replace the entire content of `cortex-app/app/(app)/desafio/resultado.tsx`:

```tsx
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useResultStore } from '../../../stores/result.store'
import { StepCelebration } from '../../../components/resultado/StepCelebration'
import { StepScoreXP } from '../../../components/resultado/StepScoreXP'
import { StepStreak } from '../../../components/resultado/StepStreak'
import { colors } from '../../../lib/theme'

type Step = 1 | 2 | 3

/**
 * ResultadoScreen — 3-step animated post-challenge celebration.
 * Step 1: confetti + celebration. Step 2: score/XP bars. Step 3: streak.
 * Session data comes from resultStore, populated before navigation.
 */
export default function ResultadoScreen() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const { xpEarned, correctCount, totalCount, maxCombo, streakDays, reset } =
    useResultStore()

  const handleHome = () => {
    reset()
    router.replace('/(app)')
  }

  const handleNewChallenge = () => {
    reset()
    router.replace('/(app)/desafio')
  }

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <StepCelebration
          totalCount={totalCount}
          onAdvance={() => setStep(2)}
        />
      ) : step === 2 ? (
        <StepScoreXP
          xpEarned={xpEarned}
          correctCount={correctCount}
          totalCount={totalCount}
          maxCombo={maxCombo}
          onAdvance={() => setStep(3)}
        />
      ) : (
        <StepStreak
          streakDays={streakDays}
          onHome={handleHome}
          onNewChallenge={handleNewChallenge}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add cortex-app/app/(app)/desafio/resultado.tsx
git commit -m "feat: replace resultado screen with 3-step animated flow"
```

---

## Task 11: ChallengeScreen — accumulate session stats

**Files:**
- Modify: `cortex-app/app/(app)/desafio/index.tsx`

- [ ] **Step 1: Add session stat accumulators and resultStore integration**

In `cortex-app/app/(app)/desafio/index.tsx`, apply these changes:

**Add imports** (after existing imports):

```tsx
import { useResultStore } from '../../../stores/result.store'
import { useDailyStore } from '../../../stores/daily.store'
import { getDashboard } from '../../../services/dashboard.service'
import type { DashboardData } from '../../../types/domain'
```

**Add state** (after the existing `const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)` line):

```tsx
const [totalXpEarned, setTotalXpEarned] = useState(0)
const [correctCount, setCorrectCount] = useState(0)
const [maxCombo, setMaxCombo] = useState(0)
const saveResultData = useResultStore((s) => s.setResult)
const incrementToday = useDailyStore((s) => s.incrementToday)
```

**Update `submitMutation.onSuccess`** (replace the existing `onSuccess`):

```tsx
onSuccess: (attemptResult) => {
  setAttemptResult(attemptResult)
  const newConsecutive = attemptResult.isCorrect ? consecutiveCorrect + 1 : 0
  setConsecutiveCorrect(newConsecutive)
  setTotalXpEarned((prev) => prev + attemptResult.xpEarned)
  if (attemptResult.isCorrect) {
    setCorrectCount((prev) => prev + 1)
  }
  setMaxCombo((prev) => Math.max(prev, newConsecutive))
},
```

> Note: the existing `setResult` local state setter is for `AttemptResult | null` (overlay). Rename it to `setAttemptResult` to avoid collision:

Replace the existing state declaration:
```tsx
const [result, setResult] = useState<AttemptResult | null>(null)
```
with:
```tsx
const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null)
```

Update all references to `result` → `attemptResult` and `setResult` → `setAttemptResult` in the component (4 occurrences in `onSuccess`, `handleSelect`, `handleNext`, and the JSX).

**Update `completeMutation`** (replace the existing mutation):

```tsx
const completeMutation = useMutation({
  mutationFn: () => completeChallenge(session!.challengeId),
  onSuccess: async () => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.brainCurrent })
    queryClient.invalidateQueries({ queryKey: QueryKeys.challengeNext })
    const freshDashboard = await queryClient.fetchQuery<DashboardData>({
      queryKey: QueryKeys.dashboard,
      queryFn: getDashboard,
      staleTime: 0,
    })
    saveResultData({
      xpEarned: totalXpEarned,
      correctCount,
      totalCount: session!.questions.length,
      maxCombo,
      streakDays: freshDashboard.user.streakDays,
    })
    await incrementToday()
    router.replace('/(app)/desafio/resultado')
  },
})

**Update `handleSelect`** (replace `if (result) return` with `if (attemptResult) return`):

```tsx
const handleSelect = (key: string) => {
  if (attemptResult) return
  setSelectedKey(key)
  submitMutation.mutate({ questionId: session!.questions[currentIndex].id, key })
}
```

**Update `handleNext`**:

```tsx
const handleNext = () => {
  if (!session) return
  const isLast = currentIndex === session.questions.length - 1
  if (isLast) {
    completeMutation.mutate()
  } else {
    setCurrentIndex((i) => i + 1)
    setSelectedKey(null)
    setAttemptResult(null)
  }
}
```

**Update JSX** — replace `{result ? (` with `{attemptResult ? (` and pass `result={attemptResult}`:

```tsx
{attemptResult ? (
  <FeedbackOverlay
    result={attemptResult}
    isLast={currentIndex === session.questions.length - 1}
    consecutiveCorrect={consecutiveCorrect}
    onNext={handleNext}
  />
) : null}
```

> Note: we're adding `consecutiveCorrect` prop to `FeedbackOverlay` — this will be wired in Task 12.

- [ ] **Step 2: Commit**

```bash
git add cortex-app/app/(app)/desafio/index.tsx
git commit -m "feat: accumulate session stats in challenge screen and wire resultStore"
```

---

## Task 12: FeedbackOverlay — animated improvements

**Files:**
- Modify: `cortex-app/components/challenge/FeedbackOverlay.tsx`

- [ ] **Step 1: Replace FeedbackOverlay with animated version**

Replace the entire content of `cortex-app/components/challenge/FeedbackOverlay.tsx`:

```tsx
import { View, Text, StyleSheet } from 'react-native'
import Animated, { ZoomIn, FadeInRight, FadeInDown } from 'react-native-reanimated'
import { Button } from '../ui/Button'
import { colors, font, spacing } from '../../lib/theme'
import type { AttemptResult } from '../../types/domain'

interface FeedbackOverlayProps {
  readonly result: AttemptResult
  readonly isLast: boolean
  readonly consecutiveCorrect: number
  readonly onNext: () => void
}

/** Bottom sheet shown after answering: animated icon, XP entry, combo badge. */
export const FeedbackOverlay = ({
  result,
  isLast,
  consecutiveCorrect,
  onNext,
}: FeedbackOverlayProps) => {
  const isCorrect = result.isCorrect
  const borderColor = isCorrect ? colors.emerald500 : colors.red500

  return (
    <View style={[styles.container, { borderTopColor: borderColor }]}>
      <View style={styles.topRow}>
        <Animated.Text
          entering={ZoomIn.duration(300)}
          style={[styles.resultIcon, isCorrect ? styles.correctIcon : styles.wrongIcon]}
        >
          {isCorrect ? '✓' : '✗'}
        </Animated.Text>

        <Animated.Text
          entering={FadeInRight.delay(150).duration(300)}
          style={styles.xpText}
        >
          +{result.xpEarned} XP
        </Animated.Text>

        {consecutiveCorrect >= 2 ? (
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            style={styles.comboBadge}
          >
            <Text style={styles.comboText}>🔥 Combo ×{consecutiveCorrect}</Text>
          </Animated.View>
        ) : null}
      </View>

      {result.explanation ? (
        <Text style={styles.explanation}>{result.explanation}</Text>
      ) : null}

      <Button
        label={isLast ? 'Ver Resultado' : 'Próxima Questão'}
        onPress={onNext}
        variant="primary"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg900,
    borderTopWidth: 3,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[3],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flexWrap: 'wrap',
  },
  resultIcon: {
    fontSize: font['2xl'],
    fontWeight: '800',
  },
  correctIcon: {
    color: colors.emerald400,
  },
  wrongIcon: {
    color: colors.red400,
  },
  xpText: {
    color: colors.indigo400,
    fontSize: font.base,
    fontWeight: '700',
  },
  comboBadge: {
    backgroundColor: colors.amber500_10,
    borderRadius: 20,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  comboText: {
    color: colors.amber500,
    fontSize: font.sm,
    fontWeight: '600',
  },
  explanation: {
    color: colors.text400,
    fontSize: font.sm,
    lineHeight: 20,
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add cortex-app/components/challenge/FeedbackOverlay.tsx
git commit -m "feat: animate FeedbackOverlay with ZoomIn icon, XP entry, and combo badge"
```

---

## Task 13: BrainStatus — add animated score ring

**Files:**
- Modify: `cortex-app/components/brain-status/BrainStatus.tsx`

- [ ] **Step 1: Replace BrainStatus with version including SVG score ring**

Replace the entire content of `cortex-app/components/brain-status/BrainStatus.tsx`:

```tsx
import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { AttributeBar } from './AttributeBar'
import { colors, font, spacing, radius } from '../../lib/theme'
import type { BrainMetrics } from '../../types/domain'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const RING_SIZE = 80
const RADIUS = 32
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface AttributeConfig {
  readonly label: string
  readonly color: string
  readonly value: (metrics: BrainMetrics) => number
}

const ATTRIBUTE_CONFIG: readonly AttributeConfig[] = [
  { label: 'Energia Neural', color: colors.indigo500,  value: (m) => m.energiaNeuralScore },
  { label: 'Memória',        color: colors.violet500,  value: (m) => m.memoriaScore },
  { label: 'Lógica',         color: colors.blue500,    value: (m) => m.logicaScore },
  { label: 'Interpretação',  color: colors.emerald500, value: (m) => m.interpretacaoScore },
  { label: 'Ciências',       color: colors.rose500,    value: (m) => m.cienciasScore },
]

interface BrainStatusProps {
  readonly metrics: BrainMetrics
  readonly streakDays: number
  readonly totalXP: number
}

/** Full cognitive status card: animated score ring, streak, XP, and 5 attribute bars. */
export const BrainStatus = ({ metrics, streakDays, totalXP }: BrainStatusProps) => {
  const strokeOffset = useSharedValue(CIRCUMFERENCE)

  useEffect(() => {
    const progress = Math.min(1, metrics.estimatedScore / 1000)
    strokeOffset.value = withTiming(CIRCUMFERENCE * (1 - progress), {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    })
  }, [metrics.estimatedScore])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeOffset.value,
  }))

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Status Cognitivo</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
            {/* Track */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colors.bg800}
              strokeWidth={6}
            />
            {/* Animated fill */}
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colors.indigo500}
              strokeWidth={6}
              strokeDasharray={CIRCUMFERENCE}
              strokeLinecap="round"
              animatedProps={animatedProps}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.ringScore}>{metrics.estimatedScore.toFixed(0)}</Text>
            <Text style={styles.ringUnit}>pts</Text>
          </View>
        </View>

        <View style={styles.scoreStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>dias seguidos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP total</Text>
          </View>
        </View>
      </View>

      <View style={styles.barsContainer}>
        {ATTRIBUTE_CONFIG.map((config) => (
          <AttributeBar
            key={config.label}
            label={config.label}
            value={config.value(metrics)}
            color={config.color}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text100,
    fontWeight: '600',
    fontSize: font.base,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
  },
  ringSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScore: {
    color: colors.text100,
    fontWeight: 'bold',
    fontSize: font.base,
  },
  ringUnit: {
    color: colors.text500,
    fontSize: font.xs,
  },
  scoreStats: {
    flex: 1,
    gap: spacing[3],
  },
  statItem: {
    gap: spacing[0.5],
  },
  statValue: {
    color: colors.text100,
    fontWeight: '700',
    fontSize: font.lg,
  },
  statLabel: {
    color: colors.text500,
    fontSize: font.xs,
  },
  barsContainer: {
    gap: spacing[2],
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add cortex-app/components/brain-status/BrainStatus.tsx
git commit -m "feat: add animated SVG score ring to BrainStatus"
```

---

## Task 14: Home screen redesign

**Files:**
- Modify: `cortex-app/app/(app)/index.tsx`

- [ ] **Step 1: Hydrate dailyStore on Home mount**

At the top of `HomeScreen`, add the hydration call:

- [ ] **Step 2: Replace app/(app)/index.tsx with redesigned Home**

Replace the entire content of `cortex-app/app/(app)/index.tsx`:

```tsx
import { useEffect } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../services/dashboard.service'
import { useAuthStore } from '../../stores/auth.store'
import { useDailyStore } from '../../stores/daily.store'
import { BrainStatus } from '../../components/brain-status'
import { AnimatedProgressBar } from '../../components/ui/AnimatedProgressBar'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../lib/query-keys'
import { xpProgress, xpForLevel, xpForNextLevel } from '../../lib/xp'
import { colors, radius, spacing, font } from '../../lib/theme'

const DAILY_GOAL = 3

export default function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { count: sessionsToday, isReady: dailyReady, hydrate } = useDailyStore()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: QueryKeys.dashboard,
    queryFn: getDashboard,
  })

  useEffect(() => {
    hydrate()
  }, [])

  const level = dashboard?.user.level ?? user?.level ?? 1
  const xp = dashboard?.user.xp ?? user?.xp ?? 0
  const streakDays = dashboard?.user.streakDays ?? user?.streakDays ?? 0
  const xpNext = xpForNextLevel(level)
  const xpCurrent = xpForLevel(level)
  const progressPercent = Math.round(xpProgress(xp, level) * 100)

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

      {/* Header row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingLabel}>Olá,</Text>
          <Text style={styles.greetingName}>{user?.name ?? '—'}</Text>
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakFlame}>🔥</Text>
          <Text style={styles.streakCount}>{streakDays}</Text>
          <View style={styles.pillDivider} />
          <Text style={styles.levelText}>Nv.{level}</Text>
        </View>
      </View>

      {/* Score Cognitivo */}
      {isLoading ? (
        <SkeletonLoader width="100%" height={220} rounded />
      ) : dashboard ? (
        <BrainStatus
          metrics={dashboard.brainMetrics}
          streakDays={streakDays}
          totalXP={xp}
        />
      ) : null}

      {/* XP & Nível */}
      {isLoading ? (
        <SkeletonLoader width="100%" height={64} rounded />
      ) : (
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>Nível {level} → {level + 1}</Text>
            <Text style={styles.xpValue}>{xp} / {xpNext} XP</Text>
          </View>
          <AnimatedProgressBar
            value={progressPercent}
            color={colors.indigo500}
            duration={800}
            delay={200}
            height={6}
          />
        </View>
      )}

      {/* CTA card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Próximo Desafio</Text>
        <Text style={styles.cardSubtext}>Continue treinando seu cérebro hoje.</Text>

        {/* Daily goal checkboxes */}
        {dailyReady ? (
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Meta do dia</Text>
            <View style={styles.checkboxes}>
              {Array.from({ length: DAILY_GOAL }).map((_, i) => {
                const done = i < sessionsToday
                return (
                  <View
                    key={i}
                    style={[styles.checkbox, done ? styles.checkboxDone : styles.checkboxPending]}
                  >
                    <Text style={styles.checkboxText}>{done ? '✓' : String(i + 1)}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(app)/desafio')}
          accessibilityRole="button"
          accessibilityLabel="Iniciar desafio"
        >
          <Text style={styles.ctaButtonText}>Iniciar Desafio</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    gap: spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingLabel: {
    color: colors.text500,
    fontSize: font.sm,
  },
  greetingName: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
  },
  streakFlame: {
    fontSize: font.base,
  },
  streakCount: {
    color: colors.orange500,
    fontWeight: 'bold',
    fontSize: font.sm,
  },
  pillDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.bg800,
  },
  levelText: {
    color: colors.indigo400,
    fontWeight: '600',
    fontSize: font.sm,
  },
  xpCard: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    color: colors.text500,
    fontSize: font.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  xpValue: {
    color: colors.indigo400,
    fontSize: font.xs,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  cardLabel: {
    color: colors.text500,
    fontSize: font.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardSubtext: {
    color: colors.text400,
    fontSize: font.sm,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  goalLabel: {
    color: colors.text500,
    fontSize: font.xs,
  },
  checkboxes: {
    flexDirection: 'row',
    gap: spacing[1.5],
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.indigo500,
  },
  checkboxPending: {
    backgroundColor: colors.bg800,
    borderWidth: 1,
    borderColor: colors.bg800,
  },
  checkboxText: {
    color: colors.white,
    fontSize: font.xs,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: colors.indigo500,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: font.base,
  },
})
```

- [ ] **Step 3: Commit**

```bash
git add cortex-app/app/(app)/index.tsx
git commit -m "feat: redesign Home with score ring, XP bar, streak pill, and daily goal"
```

---

## Task 15: Final verification

- [ ] **Step 1: Run all tests**

```bash
cd cortex-app && npx vitest run
```

Expected: all tests PASS (including new xp, result.store, and daily.store tests)

- [ ] **Step 2: TypeScript check**

```bash
cd cortex-app && npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 3: Manual smoke test**

Start the app and verify:
1. **Home**: streak pill visible in header, XP bar animates on load, daily checkboxes visible
2. **Challenge**: complete a question — FeedbackOverlay shows animated ✓/✗ icon, XP fades in from right, combo badge appears after 2 consecutive correct answers
3. **Resultado passo 1**: confetti fires, emoji springs in from below, auto-advances after 2.5s
4. **Resultado passo 2**: 3 bars animate in sequence with 300ms stagger, "Continuar" appears after 650ms
5. **Resultado passo 3**: flame pulses, number counts up, calendar cells cascade in
6. **Back to Home**: sessionsToday count incremented, daily checkbox updated

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: cortex mobile wow UX upgrade — animated Home, 3-step result, FeedbackOverlay"
```
