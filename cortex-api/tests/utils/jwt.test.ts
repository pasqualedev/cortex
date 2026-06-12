import { describe, it, expect } from 'vitest'
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/jwt'

describe('jwt utils', () => {
  it('signAccessToken returns a string token', () => {
    const token = signAccessToken('user-123')
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('verifyAccessToken returns userId from valid token', () => {
    const token = signAccessToken('user-123')
    const result = verifyAccessToken(token)
    expect(result).toBe('user-123')
  })

  it('verifyAccessToken returns null for invalid token', () => {
    const result = verifyAccessToken('not.a.token')
    expect(result).toBeNull()
  })

  it('signRefreshToken and verifyRefreshToken round-trip', () => {
    const token = signRefreshToken('user-456')
    const result = verifyRefreshToken(token)
    expect(result).toBe('user-456')
  })
})
