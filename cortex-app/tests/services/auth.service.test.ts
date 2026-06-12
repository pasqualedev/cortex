import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../lib/api', () => ({ api: { post: vi.fn(), delete: vi.fn() } }))

import { api } from '../../lib/api'
import { login, register, refresh } from '../../services/auth.service'

const mockTokens = { accessToken: 'at', refreshToken: 'rt' }
const mockUser = { id: '1', email: 'a@b.com', name: 'Test', image: null, xp: 0, level: 1, streakDays: 0, hasCompletedOnboarding: false }

describe('auth.service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('login calls POST /v1/auth/login and returns user + tokens', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { user: mockUser, tokens: mockTokens } })
    const result = await login({ email: 'a@b.com', password: '123456' })
    expect(api.post).toHaveBeenCalledWith('/v1/auth/login', { email: 'a@b.com', password: '123456' })
    expect(result.tokens.accessToken).toBe('at')
  })

  it('register calls POST /v1/auth/register', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { user: mockUser, tokens: mockTokens } })
    const result = await register({ name: 'Test', email: 'a@b.com', password: '123456' })
    expect(api.post).toHaveBeenCalledWith('/v1/auth/register', { name: 'Test', email: 'a@b.com', password: '123456' })
    expect(result.user.name).toBe('Test')
  })

  it('refresh calls POST /v1/auth/refresh', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockTokens })
    const result = await refresh('old-rt')
    expect(api.post).toHaveBeenCalledWith('/v1/auth/refresh', { refreshToken: 'old-rt' })
    expect(result.accessToken).toBe('at')
  })
})
