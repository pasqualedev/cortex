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
