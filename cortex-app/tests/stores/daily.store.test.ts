import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
}))

import * as SecureStore from 'expo-secure-store'
import { useDailyStore } from '../../stores/daily.store'

const TODAY = '2026-06-13'

describe('useDailyStore', () => {
  beforeEach(() => {
    useDailyStore.setState({ date: '', count: 0, isReady: false })
    vi.clearAllMocks()
  })

  it('starts with count 0 and isReady false', () => {
    const s = useDailyStore.getState()
    expect(s.count).toBe(0)
    expect(s.isReady).toBe(false)
  })

  it('hydrate loads persisted count when date matches today', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(
      JSON.stringify({ date: TODAY, count: 2 })
    )
    await useDailyStore.getState().hydrate(TODAY)
    const s = useDailyStore.getState()
    expect(s.count).toBe(2)
    expect(s.isReady).toBe(true)
  })

  it('hydrate resets count when date does not match today', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(
      JSON.stringify({ date: '2026-06-12', count: 3 })
    )
    await useDailyStore.getState().hydrate(TODAY)
    const s = useDailyStore.getState()
    expect(s.count).toBe(0)
    expect(s.isReady).toBe(true)
  })

  it('hydrate handles null storage (first launch)', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(null)
    await useDailyStore.getState().hydrate(TODAY)
    const s = useDailyStore.getState()
    expect(s.count).toBe(0)
    expect(s.isReady).toBe(true)
  })

  it('incrementToday increases count and persists', async () => {
    useDailyStore.setState({ date: TODAY, count: 1, isReady: true })
    await useDailyStore.getState().incrementToday(TODAY)
    expect(useDailyStore.getState().count).toBe(2)
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'cortex_daily_sessions_v1',
      JSON.stringify({ date: TODAY, count: 2 })
    )
  })
})
