import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from '../lib/storage-keys'

interface DailyState {
  readonly date: string
  readonly count: number
  readonly isReady: boolean
  hydrate: (today?: string) => Promise<void>
  incrementToday: (today?: string) => Promise<void>
}

const todayISO = () => new Date().toISOString().slice(0, 10)

/**
 * Tracks how many challenge sessions were completed today.
 * Resets automatically on a new day.
 */
export const useDailyStore = create<DailyState>((set, get) => ({
  date: '',
  count: 0,
  isReady: false,

  hydrate: async (today = todayISO()) => {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.DAILY_SESSIONS)
    if (!raw) {
      set({ date: today, count: 0, isReady: true })
      return
    }
    const parsed = JSON.parse(raw) as { date: string; count: number }
    if (parsed.date !== today) {
      set({ date: today, count: 0, isReady: true })
    } else {
      set({ date: today, count: parsed.count, isReady: true })
    }
  },

  incrementToday: async (today = todayISO()) => {
    const newCount = get().count + 1
    set({ date: today, count: newCount })
    await SecureStore.setItemAsync(
      STORAGE_KEYS.DAILY_SESSIONS,
      JSON.stringify({ date: today, count: newCount })
    )
  },
}))
