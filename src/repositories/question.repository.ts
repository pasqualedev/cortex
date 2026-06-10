import { prisma } from "@/lib/prisma"
import type { Alternative, Question } from "@/models/question.model"

function mapQuestion(q: {
  id: string
  externalId: string
  year: number
  index: number
  area: string
  topic: string
  subtopic: string
  statement: string
  alternatives: unknown
  correctKey: string
  difficulty: number
  imageUrl: string | null
}): Question {
  return {
    ...q,
    alternatives: q.alternatives as Alternative[],
  }
}

/**
 * Fetches questions for a daily challenge, prioritizing weak topics and
 * excluding recently answered questions.
 *
 * @param params.userId - The user's ID (reserved for future personalization)
 * @param params.weakTopics - Topics to prioritize in the result set
 * @param params.avoidQuestionIds - Question IDs to exclude from results
 * @param params.limit - Maximum number of questions to return
 */
export async function findQuestionsForChallenge(params: {
  userId: string
  weakTopics: readonly string[]
  avoidQuestionIds: readonly string[]
  limit: number
}): Promise<Question[]> {
  const { weakTopics, avoidQuestionIds, limit } = params
  const excluded = avoidQuestionIds as string[]

  // First: fill as many slots as possible with weak-topic questions
  const weakQuestions = weakTopics.length > 0
    ? await prisma.question.findMany({
        where: { topic: { in: weakTopics as string[] }, id: { notIn: excluded } },
        take: limit,
      })
    : []

  const remaining = limit - weakQuestions.length

  // Second: fill remaining slots with any other questions
  const weakIds = weakQuestions.map((q) => q.id)
  const otherQuestions = remaining > 0
    ? await prisma.question.findMany({
        where: {
          id: { notIn: [...excluded, ...weakIds] },
          topic: weakTopics.length > 0 ? { notIn: weakTopics as string[] } : undefined,
        },
        take: remaining,
      })
    : []

  return [...weakQuestions, ...otherQuestions].map(mapQuestion)
}

/**
 * Returns the IDs of questions answered by a user within the given number of
 * past days.
 *
 * @param userId - The user's ID
 * @param daysSince - Number of days to look back
 */
export async function findRecentlyAnsweredQuestionIds(
  userId: string,
  daysSince: number
): Promise<string[]> {
  const since = new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000)
  const answers = await prisma.answer.findMany({
    where: { userId, answeredAt: { gte: since } },
    select: { questionId: true },
    distinct: ["questionId"],
  })
  return answers.map((a) => a.questionId)
}

/**
 * Finds a single question by its primary key.
 *
 * @param id - The question's primary key
 * @returns The question or null if not found
 */
export async function findQuestionById(id: string): Promise<Question | null> {
  const q = await prisma.question.findUnique({ where: { id } })
  if (!q) return null
  return mapQuestion(q)
}
