import { AxiosError, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'
import { api } from './api'
import { useAuthStore } from '../stores/auth.store'

const ACCESS_KEY = 'cortex_access_token'
const REFRESH_KEY = 'cortex_refresh_token'

let isRefreshing = false
let queue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

const flushQueue = (error: unknown, token: string | null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  queue = []
}

export const setupInterceptors = (): void => {
  api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(ACCESS_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      if (error.response?.status !== 401 || original._retry) return Promise.reject(error)

      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject })).then(
          (token) => { original.headers.Authorization = `Bearer ${token}`; return api(original) },
        )
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY)
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await api.post<{ accessToken: string; refreshToken: string }>(
          '/v1/auth/refresh',
          { refreshToken },
        )
        await SecureStore.setItemAsync(ACCESS_KEY, data.accessToken)
        await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken)
        flushQueue(null, data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (err) {
        flushQueue(err, null)
        await useAuthStore.getState().clearAuth()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    },
  )
}
