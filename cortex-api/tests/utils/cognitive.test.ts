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
  it('returns low score for fewer than 20 attempts (cold start)', () => {
    const attempts = [
      { isCorrect: true, daysAgo: 1 },
      { isCorrect: true, daysAgo: 2 },
    ]
    const score = calculateAccuracyScore(attempts)
    expect(score).toBeLessThanOrEqual(10)
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

  it('returns 1000 for perfect accuracy across all areas', () => {
    const score = calculateEstimatedScore({
      logica: 1.0,
      ciencias: 1.0,
      interpretacao: 1.0,
      memoria: 1.0,
    })
    expect(score).toBeCloseTo(1000, 0)
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
