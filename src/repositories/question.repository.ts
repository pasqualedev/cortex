import { prisma } from "@/lib/prisma"

export interface Alternative {
  readonly key: string
  readonly text: string
}

export interface Question {
  readonly id: string
  readonly externalId: string
  readonly year: number
  readonly index: number
  readonly area: string
  readonly topic: string
  readonly subtopic: string
  readonly statement: string
  readonly alternatives: readonly Alternative[]
  readonly correctKey: string
  readonly difficulty: number
  readonly imageUrl: string | null
}

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

  const questions = await prisma.question.findMany({
    where: {
      id: { notIn: avoidQuestionIds as string[] },
    },
    take: limit * 3,
  })

  const weak = questions.filter((q) => weakTopics.includes(q.topic))
  const others = questions.filter((q) => !weakTopics.includes(q.topic))
  const pool = [...weak, ...others].slice(0, limit)

  return pool.map(mapQuestion)
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
