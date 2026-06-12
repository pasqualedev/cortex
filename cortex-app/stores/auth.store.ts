import { create } from 'zustand'

interface AuthState {
  readonly accessToken: string | null
  readonly refreshToken: string | null
  clearAuth: () => Promise<void>
}

/**
 * Zustand store for authentication state.
 * Manages access/refresh tokens and provides clearAuth for logout flows.
 */
export const useAuthStore = create<AuthState>()(() => ({
  accessToken: null,
  refreshToken: null,
  clearAuth: async () => {
    useAuthStore.setState({ accessToken: null, refreshToken: null })
  },
}))
