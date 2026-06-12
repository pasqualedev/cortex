import { PrismaClient } from '@prisma/client'
import { CognitiveImpactItem } from '../types/domain.types'

interface CreateAttemptInput {
  readonly userId: string
  readonly questionId: string
  readonly challengeId: string
  readonly chosenKey: string
  readonly isCorrect: boolean
  readonly xpEarned: number
  readonly cognitiveImpact: readonly CognitiveImpactItem[]
}

interface AttemptForCalc {
  readonly isCorrect: boolean
  readonly answeredAt: Date
}

/** Repository for Attempt model. */
export class AnswerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateAttemptInput): Promise<void> {
    await this.prisma.attempt.create({
      data: {
        userId: input.userId,
        questionId: input.questionId,
        challengeId: input.challengeId,
        chosenKey: input.chosenKey,
        isCorrect: input.isCorrect,
        xpEarned: input.xpEarned,
        cognitiveImpact: input.cognitiveImpact as object[],
      },
    })
  }

  async existsInChallenge(challengeId: string, questionId: string): Promise<boolean> {
    const attempt = await this.prisma.attempt.findFirst({
      where: { challengeId, questionId },
      select: { id: true },
    })
    return attempt !== null
  }

  async findByUserAndTopic(userId: string, topicId: string): Promise<AttemptForCalc[]> {
    return this.prisma.attempt.findMany({
      where: { userId, question: { topicId } },
      select: { isCorrect: true, answeredAt: true },
      orderBy: { answeredAt: 'desc' },
    })
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.attempt.count({ where: { userId } })
  }

  async countByUserLast7Days(userId: string): Promise<number> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return this.prisma.attempt.count({
      where: { userId, answeredAt: { gte: sevenDaysAgo } },
    })
  }
}
