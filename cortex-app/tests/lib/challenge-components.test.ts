import { describe, it, expect } from 'vitest'
import type { QuestionDTO, AttemptResult } from '../../types/domain'

const mockQuestion: QuestionDTO = {
  id: 'q1',
  statement: 'Qual é a fórmula da água?',
  alternatives: [
    { key: 'A', text: 'H2O' },
    { key: 'B', text: 'CO2' },
    { key: 'C', text: 'NaCl' },
    { key: 'D', text: 'O2' },
    { key: 'E', text: 'CH4' },
  ],
  imageUrl: null,
  year: 2023,
  topic: { name: 'Química', cognitiveAttribute: 'CIENCIAS' },
}

const mockResult: AttemptResult = {
  isCorrect: true,
  correctKey: 'A',
  xpEarned: 10,
  cognitiveImpact: [{ attribute: 'CIENCIAS', delta: 2 }],
  explanation: 'A água é H2O.',
}

describe('QuestionDTO shape', () => {
  it('has 5 alternatives', () => {
    expect(mockQuestion.alternatives).toHaveLength(5)
  })

  it('alternatives have key and text', () => {
    mockQuestion.alternatives.forEach((alt) => {
      expect(alt).toHaveProperty('key')
      expect(alt).toHaveProperty('text')
    })
  })

  it('topic has cognitiveAttribute', () => {
    expect(mockQuestion.topic.cognitiveAttribute).toBe('CIENCIAS')
  })
})

describe('AttemptResult shape', () => {
  it('has required fields', () => {
    expect(mockResult.isCorrect).toBe(true)
    expect(mockResult.correctKey).toBe('A')
    expect(mockResult.xpEarned).toBeGreaterThan(0)
  })
})
