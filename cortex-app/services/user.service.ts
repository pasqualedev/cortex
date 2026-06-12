import { api } from '../lib/api'
import type { User } from '../types/domain'

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/v1/users/me')
  return data
}

export const updateMe = async (payload: Partial<Pick<User, 'name'>>): Promise<User> => {
  const { data } = await api.patch<User>('/v1/users/me', payload)
  return data
}

export const completeOnboarding = async (targetScore: number): Promise<void> => {
  await api.post('/v1/users/me/onboarding', { targetScore })
}
