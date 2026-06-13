import { create } from 'zustand'

interface ResultData {
  readonly xpEarned: number
  readonly correctCount: number
  readonly totalCount: number
  readonly maxCombo: number
  readonly streakDays: number
}

interface ResultState extends ResultData {
  setResult: (data: ResultData) => void
  reset: () => void
}

const INITIAL: ResultData = {
  xpEarned: 0,
  correctCount: 0,
  totalCount: 0,
  maxCombo: 0,
  streakDays: 0,
}

/** Transient store for session result data. Populated before navigating to resultado screen. */
export const useResultStore = create<ResultState>((set) => ({
  ...INITIAL,
  setResult: (data) => set(data),
  reset: () => set(INITIAL),
}))
