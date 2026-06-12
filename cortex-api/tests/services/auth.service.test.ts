import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../../src/services/auth.service'
import { UserRepository } from '../../src/repositories/user.repository'
import { comparePassword } from '../../src/utils/password'

vi.mock('../../src/utils/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('$2b$hashed'),
  comparePassword: vi.fn(),
}))

vi.mock('../../src/utils/jwt', () => ({
  signAccessToken: vi.fn().mockReturnValue('access-token'),
  signRefreshToken: vi.fn().mockReturnValue('refresh-token'),
}))

const mockUserRepo = {
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  upsertAccount: vi.fn(),
  upsertGoal: vi.fn(),
  toDTO: vi.fn(),
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AuthService(mockUserRepo as unknown as UserRepository)
  })

  describe('register', () => {
    it('throws CONFLICT when email already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing' })

      await expect(
        service.register({ name: 'Test', email: 'test@test.com', password: '123456' }),
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('creates user and returns tokens', async () => {
      const createdUser = {
        id: 'new-user',
        email: 'test@test.com',
        name: 'Test',
        image: null,
        xp: 0,
        level: 1,
        streakDays: 0,
        goal: null,
      }
      mockUserRepo.findByEmail.mockResolvedValue(null)
      mockUserRepo.create.mockResolvedValue(createdUser)
      mockUserRepo.toDTO.mockReturnValue({
        id: 'new-user',
        email: 'test@test.com',
        name: 'Test',
        image: null,
        xp: 0,
        level: 1,
        streakDays: 0,
        estimatedScore: null,
      })

      const result = await service.register({
        name: 'Test',
        email: 'test@test.com',
        password: '123456',
      })

      expect(result.accessToken).toBe('access-token')
      expect(result.refreshToken).toBe('refresh-token')
      expect(result.user.email).toBe('test@test.com')
    })
  })

  describe('login', () => {
    it('throws UNAUTHORIZED for unknown email', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null)

      await expect(
        service.login({ email: 'nobody@test.com', password: '123456' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    })

    it('throws UNAUTHORIZED for wrong password', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        passwordHash: '$2b$hashed',
        goal: null,
      })
      vi.mocked(comparePassword).mockResolvedValue(false)

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    })

    it('returns tokens on successful login', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        image: null,
        passwordHash: '$2b$hashed',
        goal: null,
      }
      mockUserRepo.findByEmail.mockResolvedValue(user)
      vi.mocked(comparePassword).mockResolvedValue(true)
      mockUserRepo.toDTO.mockReturnValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        image: null,
        xp: 0,
        level: 1,
        streakDays: 0,
        estimatedScore: null,
      })

      const result = await service.login({ email: 'test@test.com', password: 'correct' })

      expect(result.accessToken).toBe('access-token')
      expect(result.refreshToken).toBe('refresh-token')
    })
  })

  describe('refresh', () => {
    it('throws UNAUTHORIZED for invalid token', () => {
      expect(() => service.refresh('bad-token')).toThrow()
    })
  })
})
