import { PrismaClient, Question, CognitiveAttribute } from '@prisma/client'

interface BuildSessionInput {
  readonly userId: string
  readonly topicId?: string
  readonly difficulty?: number
  readonly limit: number
}

type QuestionWithTopic = Question & {
  topic: { name: string; cognitiveAttribute: CognitiveAttribute }
}

/** Repository for Question model. Handles question selection logic for challenge sessions. */
export class QuestionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Selects questions for a challenge session.
   * Priority: previously incorrect > unseen. Avoids last 30 answered questions.
   */
  async selectForSession(input: BuildSessionInput): Promise<QuestionWithTopic[]> {
    const { userId, topicId, difficulty, limit } = input

    const recentAnsweredIds = await this.prisma.attempt.findMany({
      where: { userId },
      orderBy: { answeredAt: 'desc' },
      take: 30,
      select: { questionId: true },
    })
    const excludeIds = recentAnsweredIds.map((a) => a.questionId)

    const incorrectFirst = await this.prisma.question.findMany({
      where: {
        id: { notIn: excludeIds },
        ...(topicId ? { topicId } : {}),
        ...(difficulty ? { difficulty } : {}),
        attempts: { some: { userId, isCorrect: false } },
      },
      include: { topic: { select: { name: true, cognitiveAttribute: true } } },
      take: Math.ceil(limit / 2),
      orderBy: { createdAt: 'asc' },
    })

    const needed = limit - incorrectFirst.length
    const usedIds = [...excludeIds, ...incorrectFirst.map((q) => q.id)]

    const filler = await this.prisma.question.findMany({
      where: {
        id: { notIn: usedIds },
        ...(topicId ? { topicId } : {}),
        ...(difficulty ? { difficulty } : {}),
      },
      include: { topic: { select: { name: true, cognitiveAttribute: true } } },
      take: needed,
      orderBy: { createdAt: 'asc' },
    })

    return [...incorrectFirst, ...filler]
  }

  async findById(id: string): Promise<QuestionWithTopic | null> {
    return this.prisma.question.findUnique({
      where: { id },
      include: { topic: { select: { name: true, cognitiveAttribute: true } } },
    })
  }
}
