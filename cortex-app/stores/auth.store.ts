import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import type { User } from '../types/domain'
import { STORAGE_KEYS } from '../lib/storage-keys'

interface AuthState {
  readonly user: User | null
  readonly accessToken: string | null
  readonly isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>
  clearAuth: () => Promise<void>
  setUser: (user: User) => void
}

/**
 * Zustand store for authentication state.
 * Persists access and refresh tokens via expo-secure-store.
 * Provides setAuth for login/register flows and clearAuth for logout.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    set({ user, accessToken, isAuthenticated: true })
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN)
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN)
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  setUser: (user) => set({ user }),
}))
