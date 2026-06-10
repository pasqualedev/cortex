import type { SubmitAnswerInput, AnswerResult } from "@/models/answer.model"
import { findUserById, updateUserProgress } from "@/repositories/user.repository"
import { findQuestionById } from "@/repositories/question.repository"
import { createAnswer } from "@/repositories/answer.repository"
import { upsertSkillProgress } from "@/repositories/skill-progress.repository"

/**
 * Cumulative XP thresholds for each level (index 0 = level 1 at 0 XP,
 * index 1 = level 2 at 100 XP, etc.).
 */
export const LEVEL_THRESHOLDS: readonly number[] = (() => {
  const thresholds: number[] = [0]
  for (let n = 2; n <= 50; n++) {
    thresholds.push(thresholds[n - 2] + n * 50)
  }
  return thresholds
})()

/**
 * Calculates XP earned for a single answer attempt.
 * Correct answers earn 10 XP base, plus 5 bonus after 3+ consecutive correct.
 * Wrong answers always earn 3 XP.
 *
 * @param params.isCorrect - Whether the answer was correct
 * @param params.consecutiveCorrect - Number of consecutive correct answers so far
 */
export function calcXpEarned(params: {
  readonly isCorrect: boolean
  readonly consecutiveCorrect: number
}): number {
  if (!params.isCorrect) return 3
  const bonus = params.consecutiveCorrect >= 3 ? 5 : 0
  return 10 + bonus
}

/**
 * Determines the player level based on total accumulated XP.
 *
 * @param totalXp - Total XP accumulated by the user
 */
export function calcNewLevel(totalXp: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return level
}

/**
 * Calculates the updated study streak based on the last study date.
 * - Same day: streak unchanged
 * - Yesterday (1–2 days ago): streak incremented
 * - 2+ days ago or never studied: streak reset to 1
 *
 * @param params.currentStreak - Current streak count in days
 * @param params.lastStudiedAt - Date of last study session, or null if never
 */
export function calcNewStreak(params: {
  readonly currentStreak: number
  readonly lastStudiedAt: Date | null
}): number {
  const { currentStreak, lastStudiedAt } = params
  if (!lastStudiedAt) return 1

  const diffMs = Date.now() - lastStudiedAt.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < 1) return currentStreak
  if (diffDays < 2) return currentStreak + 1
  return 1
}

/**
 * Persists an answer submission and updates user XP, level, streak,
 * and skill-level progress in parallel.
 *
 * @param userId - ID of the user submitting the answer
 * @param input - The answer input (questionId + chosenKey)
 * @param consecutiveCorrect - Number of consecutive correct answers before this one
 */
export async function submitAnswer(
  userId: string,
  input: SubmitAnswerInput,
  consecutiveCorrect: number
): Promise<AnswerResult> {
  const [user, question] = await Promise.all([
    findUserById(userId),
    findQuestionById(input.questionId),
  ])

  if (!user || !question) throw new Error("User or question not found")

  const isCorrect = question.correctKey === input.chosenKey
  const xpEarned = calcXpEarned({ isCorrect, consecutiveCorrect })
  const newXp = user.xp + xpEarned
  const newLevel = calcNewLevel(newXp)
  const newStreakDays = calcNewStreak({
    currentStreak: user.streakDays,
    lastStudiedAt: user.lastStudiedAt,
  })

  await Promise.all([
    createAnswer({ userId, questionId: input.questionId, chosenKey: input.chosenKey, isCorrect, xpEarned }),
    upsertSkillProgress({ userId, area: question.area, topic: question.topic, isCorrect }),
    updateUserProgress(userId, { xp: newXp, level: newLevel, streakDays: newStreakDays, lastStudiedAt: new Date() }),
  ])

  return { isCorrect, xpEarned, correctKey: question.correctKey, newXp, newLevel, newStreakDays }
}
