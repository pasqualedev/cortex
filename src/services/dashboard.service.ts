import type { DashboardData, AreaSummary } from "@/models/user.model"
import { findUserById } from "@/repositories/user.repository"
import { findAllSkillProgress } from "@/repositories/skill-progress.repository"
import { countRecentAnswers } from "@/repositories/answer.repository"

/** Calculates neural energy percentage from streak and recent activity */
export function calcEnergiaNeuralPct(params: {
  readonly streakDays: number
  readonly recentAnswers: number
}): number {
  return Math.min(100, params.streakDays * 5 + params.recentAnswers * 2)
}

/** Calculates long-term memory percentage as weighted accuracy across all topics */
export function calcMemoriaLongoPrazoPct(
  progress: readonly { accuracy: number; total: number }[]
): number {
  if (progress.length === 0) return 0
  const totalAnswers = progress.reduce((sum, p) => sum + p.total, 0)
  if (totalAnswers === 0) return 0
  const weighted = progress.reduce((sum, p) => sum + p.accuracy * p.total, 0)
  return Math.round((weighted / totalAnswers) * 100)
}

/** Aggregates all dashboard data for a user */
export async function getDashboardData(userId: string): Promise<DashboardData | null> {
  const user = await findUserById(userId)
  if (!user) return null

  const [skillProgress, recentAnswers] = await Promise.all([
    findAllSkillProgress(userId),
    countRecentAnswers(userId, 7),
  ])

  const energiaNeuralPct = calcEnergiaNeuralPct({
    streakDays: user.streakDays,
    recentAnswers,
  })
  const memoriaLongoPrazoPct = calcMemoriaLongoPrazoPct(skillProgress)

  const areaMap = new Map<string, { total: number; correctSum: number }>()
  for (const sp of skillProgress) {
    const existing = areaMap.get(sp.area) ?? { total: 0, correctSum: 0 }
    areaMap.set(sp.area, {
      total: existing.total + sp.total,
      correctSum: existing.correctSum + sp.correct,
    })
  }

  const skillSummary: AreaSummary[] = Array.from(areaMap.entries()).map(
    ([area, { total, correctSum }]) => ({
      area,
      accuracy: total > 0 ? correctSum / total : 0,
      total,
    })
  )

  return { user, energiaNeuralPct, memoriaLongoPrazoPct, skillSummary }
}
