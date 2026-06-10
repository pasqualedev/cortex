import type { Question } from "@/models/question.model"
import type { SkillProgressEntry } from "@/models/skill-progress.model"
import { findQuestionsForChallenge, findRecentlyAnsweredQuestionIds } from "@/repositories/question.repository"
import { findAllSkillProgress } from "@/repositories/skill-progress.repository"

const CHALLENGE_SIZE = 10
const AVOID_REPEAT_DAYS = 7
const WEAK_THRESHOLD = 0.6

/**
 * Returns topics where accuracy is strictly below the weak threshold.
 *
 * @param progress - Array of skill progress entries to evaluate
 * @returns Array of topic names considered weak
 */
export function getWeakTopics(progress: readonly SkillProgressEntry[]): string[] {
  return progress
    .filter((p) => p.accuracy < WEAK_THRESHOLD)
    .map((p) => p.topic)
}

/**
 * Builds a challenge session for a user, prioritizing weak topics and
 * avoiding recently answered questions.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of questions selected for the challenge session
 */
export async function buildChallengeSession(userId: string): Promise<Question[]> {
  const [skillProgress, recentIds] = await Promise.all([
    findAllSkillProgress(userId),
    findRecentlyAnsweredQuestionIds(userId, AVOID_REPEAT_DAYS),
  ])

  const weakTopics = getWeakTopics(skillProgress)

  return findQuestionsForChallenge({
    userId,
    weakTopics,
    avoidQuestionIds: recentIds,
    limit: CHALLENGE_SIZE,
  })
}
