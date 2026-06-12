import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrainService } from '../../src/services/brain.service'

const mockBrainRepo = {
  findCurrentByUser: vi.fn(),
  upsert: vi.fn(),
  takeSnapshot: vi.fn(),
  findHistory: vi.fn(),
}

const mockAnswerRepo = {
  findByUserAndTopic: vi.fn(),
  countByUserLast7Days: vi.fn(),
  countByUser: vi.fn(),
  existsInChallenge: vi.fn(),
  create: vi.fn(),
}

describe('BrainService.recalculateForUser', () => {
  let service: BrainService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new BrainService(mockBrainRepo as never, mockAnswerRepo as never)
  })

  it('sets energiaNeuralScore based on last 7 days activity', async () => {
    mockAnswerRepo.countByUserLast7Days.mockResolvedValue(35)
    mockAnswerRepo.findByUserAndTopic.mockResolvedValue([])
    mockBrainRepo.findCurrentByUser.mockResolvedValue(null)
    mockBrainRepo.upsert.mockImplementation((_id: string, data: unknown) => data)

    const result = await service.recalculateForUser('user-1', 'logica-topic-id')

    expect(result.energiaNeuralScore).toBeCloseTo(50, 0)
  })

  it('upserts brain metrics', async () => {
    mockAnswerRepo.countByUserLast7Days.mockResolvedValue(70)
    mockAnswerRepo.findByUserAndTopic.mockResolvedValue([])
    mockBrainRepo.findCurrentByUser.mockResolvedValue(null)
    mockBrainRepo.upsert.mockResolvedValue(undefined)

    await service.recalculateForUser('user-1', 'topic-1')

    expect(mockBrainRepo.upsert).toHaveBeenCalledOnce()
  })
})
