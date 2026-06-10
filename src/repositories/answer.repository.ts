import { prisma } from "@/lib/prisma"

/**
 * Creates a new answer record for a user's response to a question.
 * @param data - Answer data including userId, questionId, chosen key, correctness, and XP earned.
 */
export async function createAnswer(data: {
  userId: string
  questionId: string
  chosenKey: string
  isCorrect: boolean
  xpEarned: number
}): Promise<void> {
  await prisma.answer.create({ data })
}

/**
 * Counts the number of answers submitted by a user within a recent time window.
 * @param userId - The ID of the user.
 * @param daysSince - Number of days to look back from now.
 * @returns Total count of answers in the specified time window.
 */
export async function countRecentAnswers(
  userId: string,
  daysSince: number
): Promise<number> {
  const since = new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000)
  return prisma.answer.count({
    where: { userId, answeredAt: { gte: since } },
  })
}
