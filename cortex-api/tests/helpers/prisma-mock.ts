import { vi } from 'vitest'

export type MockPrisma = {
  user: {
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  account: {
    upsert: ReturnType<typeof vi.fn>
  }
  goal: {
    upsert: ReturnType<typeof vi.fn>
  }
  brainMetrics: {
    upsert: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
  }
}

export function createMockPrisma(): MockPrisma {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    account: {
      upsert: vi.fn(),
    },
    goal: {
      upsert: vi.fn(),
    },
    brainMetrics: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
  }
}
