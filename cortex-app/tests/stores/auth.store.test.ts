import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}))

import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../../stores/auth.store'

const mockUser = {
  id: '1', email: 'a@b.com', name: 'Test', image: null,
  xp: 0, level: 1, streakDays: 0, hasCompletedOnboarding: false,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false })
    vi.clearAllMocks()
  })

  it('starts unauthenticated', () => {
    const { isAuthenticated, user, accessToken } = useAuthStore.getState()
    expect(isAuthenticated).toBe(false)
    expect(user).toBeNull()
    expect(accessToken).toBeNull()
  })

  it('setAuth stores tokens and marks authenticated', async () => {
    await useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token')
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.accessToken).toBe('access-token')
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('cortex_access_token', 'access-token')
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('cortex_refresh_token', 'refresh-token')
  })

  it('clearAuth removes tokens and resets state', async () => {
    await useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token')
    await useAuthStore.getState().clearAuth()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('cortex_access_token')
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('cortex_refresh_token')
  })
})
