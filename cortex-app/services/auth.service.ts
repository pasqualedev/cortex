import { api } from '../lib/api'
import type { AuthResponse, TokenPair } from '../types/domain'

interface LoginInput {
  readonly email: string
  readonly password: string
}

interface RegisterInput {
  readonly name: string
  readonly email: string
  readonly password: string
}

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/v1/auth/login', input)
  return data
}

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/v1/auth/register', input)
  return data
}

export const refresh = async (refreshToken: string): Promise<TokenPair> => {
  const { data } = await api.post<TokenPair>('/v1/auth/refresh', { refreshToken })
  return data
}

export const logout = async (): Promise<void> => {
  await api.delete('/v1/auth/logout')
}
