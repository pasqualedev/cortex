import { prisma } from "@/lib/prisma"

/** Represents a single skill progress entry for a user in a given area and topic. */
export interface SkillProgressEntry {
  readonly area: string
  readonly topic: string
  readonly accuracy: number
  readonly total: number
  readonly correct: number
}

/**
 * Retrieves all skill progress records for a given user.
 * @param userId - The ID of the user.
 * @returns Array of skill progress entries.
 */
export async function findAllSkillProgress(
  userId: string
): Promise<SkillProgressEntry[]> {
  return prisma.skillProgress.findMany({
    where: { userId },
    select: { area: true, topic: true, accuracy: true, total: true, correct: true },
  })
}

/**
 * Updates or creates a skill progress record for a user, area, and topic combination.
 * Recalculates total answers, correct answers, and accuracy.
 * @param params - Object containing userId, area, topic, and whether the answer was correct.
 */
export async function upsertSkillProgress(params: {
  userId: string
  area: string
  topic: string
  isCorrect: boolean
}): Promise<void> {
  const { userId, area, topic, isCorrect } = params

  const existing = await prisma.skillProgress.findUnique({
    where: { userId_area_topic: { userId, area, topic } },
  })

  const newTotal = (existing?.total ?? 0) + 1
  const newCorrect = (existing?.correct ?? 0) + (isCorrect ? 1 : 0)
  const newAccuracy = newCorrect / newTotal

  await prisma.skillProgress.upsert({
    where: { userId_area_topic: { userId, area, topic } },
    create: { userId, area, topic, total: newTotal, correct: newCorrect, accuracy: newAccuracy },
    update: { total: newTotal, correct: newCorrect, accuracy: newAccuracy },
  })
}
