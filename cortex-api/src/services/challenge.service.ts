import { PrismaClient } from '@prisma/client'
import { QuestionRepository } from '../repositories/question.repository'
import { BrainService } from './brain.service'
import { QuestionDTO } from '../types/domain.types'

interface BuildChallengeInput {
  readonly userId: string
  readonly topicId?: string
  readonly difficulty?: number
}

interface ChallengeSession {
  readonly challengeId: string
  readonly questions: readonly QuestionDTO[]
}

/** Builds challenge sessions and marks them complete with snapshot. */
export class ChallengeService {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly brainService: BrainService,
    private readonly prisma: PrismaClient,
  ) {}

  async buildSession(input: BuildChallengeInput): Promise<ChallengeSession> {
    const questions = await this.questionRepo.selectForSession({
      userId: input.userId,
      ...(input.topicId !== undefined ? { topicId: input.topicId } : {}),
      ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
      limit: 10,
    })

    if (questions.length === 0) {
      throw Object.assign(new Error('Nenhuma questão disponível'), { code: 'NOT_FOUND' })
    }

    const challenge = await this.prisma.challenge.create({
      data: {
        userId: input.userId,
        totalQuestions: questions.length,
        challengeQuestions: {
          create: questions.map((q, i) => ({
            questionId: q.id,
            position: i + 1,
          })),
        },
      },
    })

    return {
      challengeId: challenge.id,
      questions: questions.map((q) => ({
        id: q.id,
        statement: q.statement,
        alternatives: q.alternatives as Array<{ key: string; text: string }>,
        imageUrl: q.imageUrl,
        year: q.year,
        topic: {
          name: q.topic.name,
          cognitiveAttribute: q.topic.cognitiveAttribute,
        },
      })),
    }
  }

  async completeChallenge(challengeId: string, userId: string): Promise<void> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        attempts: { select: { isCorrect: true, xpEarned: true } },
      },
    })

    if (!challenge) throw Object.assign(new Error('Desafio não encontrado'), { code: 'NOT_FOUND' })
    if (challenge.userId !== userId) throw Object.assign(new Error('Proibido'), { code: 'FORBIDDEN' })
    if (challenge.status !== 'ACTIVE') return

    const totalXP = challenge.attempts.reduce((sum, a) => sum + a.xpEarned, 0)
    const totalCorrect = challenge.attempts.filter((a) => a.isCorrect).length

    await this.prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        totalXP,
        totalCorrect,
      },
    })

    await this.brainService.takeSnapshot(userId)
  }
}
