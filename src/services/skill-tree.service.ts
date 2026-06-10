import type { SkillTreeData, AreaProgress } from "@/models/skill-progress.model"
import { findAllSkillProgress } from "@/repositories/skill-progress.repository"

/** Aggregates skill progress by area for the skill tree view */
export async function getSkillTreeData(userId: string): Promise<SkillTreeData> {
  const progress = await findAllSkillProgress(userId)
  const areaMap = new Map<string, AreaProgress>()

  for (const p of progress) {
    const existing = areaMap.get(p.area)
    if (!existing) {
      areaMap.set(p.area, { area: p.area, accuracy: p.accuracy, total: p.total, topics: [p] })
    } else {
      const newTotal = existing.total + p.total
      const newCorrect = existing.topics.reduce((s, t) => s + t.correct, 0) + p.correct
      areaMap.set(p.area, {
        area: p.area,
        accuracy: newTotal > 0 ? newCorrect / newTotal : 0,
        total: newTotal,
        topics: [...existing.topics, p],
      })
    }
  }

  return { areas: Array.from(areaMap.values()) }
}
