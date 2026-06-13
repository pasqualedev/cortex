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
