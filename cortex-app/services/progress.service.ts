import { api } from '../lib/api'
import type { BrainMetrics, BrainHistoryResponse, AchievementsResponse } from '../types/domain'

export const getBrainCurrent = async (): Promise<BrainMetrics> => {
  const { data } = await api.get<BrainMetrics>('/v1/brain/current')
  return data
}

export const getBrainHistory = async (days = 30): Promise<BrainHistoryResponse> => {
  const { data } = await api.get<BrainHistoryResponse>('/v1/brain/history', { params: { days } })
  return data
}

export const getAchievements = async (): Promise<AchievementsResponse> => {
  const { data } = await api.get<AchievementsResponse>('/v1/achievements')
  return data
}
