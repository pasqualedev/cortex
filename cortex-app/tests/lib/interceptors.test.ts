import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}))

vi.mock('../../stores/auth.store', () => ({
  useAuthStore: { getState: vi.fn(() => ({ clearAuth: vi.fn().mockResolvedValue(undefined) })) },
}))

vi.mock('../../lib/api', () => ({
  api: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

import { api } from '../../lib/api'
import { setupInterceptors } from '../../lib/interceptors'

describe('setupInterceptors', () => {
  beforeEach(() => vi.clearAllMocks())

  it('registers request and response interceptors', () => {
    setupInterceptors()
    expect(api.interceptors.request.use).toHaveBeenCalledOnce()
    expect(api.interceptors.response.use).toHaveBeenCalledOnce()
  })
})
