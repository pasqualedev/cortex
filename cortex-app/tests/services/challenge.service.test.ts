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
