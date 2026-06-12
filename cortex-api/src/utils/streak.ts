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
