import { PrismaClient } from '@prisma/client'
import { AnswerRepository } from '../repositories/answer.repository'
import { QuestionRepository } from '../repositories/question.repository'
import { UserRepository } from '../repositories/user.repository'
import { BrainService } from './brain.service'
import { AchievementService } from './achievement.service'
import { calculateStreakUpdate } from '../utils/streak'
import { AttemptResult } from '../types/domain.types'

const XP_CORRECT = 10
const XP_WRONG = 3
const XP_CONSECUTIVE_BONUS = 5

interface SubmitAnswerInput {
  readonly userId: string
  readonly challengeId: string
  readonly questionId: string
  readonly chosenKey: string
  readonly consecutiveCorrect: number
}

function calculateLevelFromXP(xp: number): number {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000]
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= (thresholds[i] ?? 0)) return i + 1
  }
  return 1
}

/** Processes answer submissions: XP, streak, brain metrics, and achievement checks. */
export class AnswerService {
  constructor(
    private readonly answerRepo: AnswerRepository,
    private readonly questionRepo: QuestionRepository,
    private readonly userRepo: UserRepository,
    private readonly brainService: BrainService,
    private readonly achievementService: AchievementService,
    private readonly prisma: PrismaClient,
  ) {}

  async submitAnswer(input: SubmitAnswerInput): Promise<AttemptResult> {
    const question = await this.questionRepo.findById(input.questionId)
    if (!question) throw Object.assign(new Error('Questão não encontrada'), { code: 'NOT_FOUND' })

    const alreadyAnswered = await this.answerRepo.existsInChallenge(input.challengeId, input.questionId)
    if (alreadyAnswered) throw Object.assign(new Error('Questão já respondida'), { code: 'CONFLICT' })

    const isCorrect = question.correctKey === input.chosenKey
    let xpEarned = isCorrect ? XP_CORRECT : XP_WRONG
    if (isCorrect && input.consecutiveCorrect > 0 && input.consecutiveCorrect % 3 === 0) {
      xpEarned += XP_CONSECUTIVE_BONUS
    }

    const user = await this.userRepo.findById(input.userId)
    if (!user) throw Object.assign(new Error('Usuário não encontrado'), { code: 'NOT_FOUND' })

    const streakResult = calculateStreakUpdate({
      currentStreakDays: user.streakDays,
      lastStudiedAt: user.lastStudiedAt,
      now: new Date(),
    })

    const newXP = user.xp + xpEarned
    const newLevel = calculateLevelFromXP(newXP)

    await this.userRepo.update(input.userId, {
      xp: newXP,
      level: newLevel,
      streakDays: streakResult.streakDays,
      lastStudiedAt: streakResult.lastStudiedAt,
    })

    const brainResult = await this.brainService.recalculateForUser(input.userId, question.topicId)
    const significantImpacts = brainResult.impacts

    await this.answerRepo.create({
      userId: input.userId,
      questionId: input.questionId,
      challengeId: input.challengeId,
      chosenKey: input.chosenKey,
      isCorrect,
      xpEarned,
      cognitiveImpact: significantImpacts,
    })

    await this.achievementService.checkAndUnlock({
      userId: input.userId,
      level: newLevel,
      streakDays: streakResult.streakDays,
      totalAttempts: 0,
      sessionCorrect: 0,
      sessionTotal: 10,
      logicaScore: brainResult.logicaScore,
    })

    return {
      isCorrect,
      correctKey: question.correctKey,
      xpEarned,
      cognitiveImpact: significantImpacts,
      explanation: null,
    }
  }
}
