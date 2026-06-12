import { AxiosError, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'
import { api } from './api'
import { useAuthStore } from '../stores/auth.store'
import { STORAGE_KEYS } from './storage-keys'

type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void }

let isRefreshing = false
let queue: QueueEntry[] = []

const flushQueue = (error: unknown, token: string): void => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  queue = []
}

const rejectQueue = (error: unknown): void => {
  queue.forEach((p) => p.reject(error))
  queue = []
}

export const setupInterceptors = (): void => {
  api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
      if (!original || error.response?.status !== 401 || original._retry) return Promise.reject(error)

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => queue.push({ resolve, reject })).then(
          (token) => { original.headers.Authorization = `Bearer ${token}`; return api(original) },
        )
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN)
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await api.post<{ accessToken: string; refreshToken: string }>(
          '/v1/auth/refresh',
          { refreshToken },
        )
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken)
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)
        flushQueue(null, data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (err) {
        rejectQueue(err)
        await useAuthStore.getState().clearAuth()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    },
  )
}
