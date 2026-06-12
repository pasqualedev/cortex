import { api } from '../lib/api'
import type { DashboardData } from '../types/domain'

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get<DashboardData>('/v1/dashboard')
  return data
}
