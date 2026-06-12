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
