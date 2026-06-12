import { describe, it, expect } from 'vitest'
import type { BrainMetrics } from '../../types/domain'

const mockMetrics: BrainMetrics = {
  energiaNeuralScore: 75,
  memoriaScore: 60,
  logicaScore: 80,
  interpretacaoScore: 55,
  cienciasScore: 70,
  estimatedScore: 68.0,
}

describe('BrainMetrics type shape', () => {
  it('has all five cognitive attribute score fields', () => {
    expect(typeof mockMetrics.energiaNeuralScore).toBe('number')
    expect(typeof mockMetrics.memoriaScore).toBe('number')
    expect(typeof mockMetrics.logicaScore).toBe('number')
    expect(typeof mockMetrics.interpretacaoScore).toBe('number')
    expect(typeof mockMetrics.cienciasScore).toBe('number')
  })

  it('all attribute values are in 0-100 range', () => {
    const scores = [
      mockMetrics.energiaNeuralScore,
      mockMetrics.memoriaScore,
      mockMetrics.logicaScore,
      mockMetrics.interpretacaoScore,
      mockMetrics.cienciasScore,
    ]
    scores.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(100)
    })
  })

  it('estimatedScore is a number', () => {
    expect(typeof mockMetrics.estimatedScore).toBe('number')
  })
})
