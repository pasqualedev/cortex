/** XP thresholds matching the backend answer.service.ts calculateLevelFromXP. */
const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000] as const

/** XP required to be at the start of `level`. */
export const xpForLevel = (level: number): number =>
  XP_THRESHOLDS[level - 1] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1]!

/** XP required to reach `level + 1`. */
export const xpForNextLevel = (level: number): number =>
  XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1]!

/** Progress ratio (0–1) within the current level. */
export const xpProgress = (xp: number, level: number): number => {
  const current = xpForLevel(level)
  const next = xpForNextLevel(level)
  if (next === current) return 1
  return Math.min(1, (xp - current) / (next - current))
}
