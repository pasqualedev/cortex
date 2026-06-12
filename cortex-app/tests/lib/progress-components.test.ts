import { describe, it, expect } from 'vitest'
import type { BrainMetrics, AchievementsResponse } from '../../types/domain'

const mockMetrics: BrainMetrics = {
  energiaNeuralScore: 72.5,
  memoriaScore: 68.0,
  logicaScore: 80.0,
  interpretacaoScore: 75.0,
  cienciasScore: 65.0,
  estimatedScore: 720,
}

const mockAchievements: AchievementsResponse = {
  unlocked: [
    { id: 'a1', name: 'Primeira Vitória', description: 'Acertou a primeira', icon: '🏆', unlockedAt: '2026-01-01' },
  ],
  locked: [
    { id: 'a2', name: 'Mestre', description: 'Complete 100 desafios', icon: '🎓', progress: 12, threshold: 100 },
  ],
}

describe('BrainMetrics shape', () => {
  it('has all score fields', () => {
    expect(mockMetrics).toHaveProperty('energiaNeuralScore')
    expect(mockMetrics).toHaveProperty('memoriaScore')
    expect(mockMetrics).toHaveProperty('logicaScore')
    expect(mockMetrics).toHaveProperty('interpretacaoScore')
    expect(mockMetrics).toHaveProperty('cienciasScore')
    expect(mockMetrics).toHaveProperty('estimatedScore')
  })
})

describe('AchievementsResponse shape', () => {
  it('has unlocked and locked arrays', () => {
    expect(Array.isArray(mockAchievements.unlocked)).toBe(true)
    expect(Array.isArray(mockAchievements.locked)).toBe(true)
  })

  it('unlocked achievement has unlockedAt', () => {
    expect(mockAchievements.unlocked[0]).toHaveProperty('unlockedAt')
  })

  it('locked achievement has progress and threshold', () => {
    expect(mockAchievements.locked[0]).toHaveProperty('progress')
    expect(mockAchievements.locked[0]).toHaveProperty('threshold')
  })
})
