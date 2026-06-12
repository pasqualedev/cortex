import { BrainRepository } from '../repositories/brain.repository'
import { AnswerRepository } from '../repositories/answer.repository'
import { BrainMetricsDTO, CognitiveImpactItem } from '../types/domain.types'
import { CognitiveAttribute } from '@prisma/client'
import {
  calculateEnergiaNeuralScore,
  calculateAccuracyScore,
  calculateEstimatedScore,
  filterSignificantImpacts,
} from '../utils/cognitive'

interface TopicIdMap {
  readonly LOGICA?: string
  readonly CIENCIAS?: string
  readonly INTERPRETACAO?: string
  readonly MEMORIA?: string
}

/**
 * Recalculates and persists cognitive brain metrics for a user.
 * Called after each answer submission to keep brain state current.
 */
export class BrainService {
  constructor(
    private readonly brainRepo: BrainRepository,
    private readonly answerRepo: AnswerRepository,
  ) {}

  async recalculateForUser(
    userId: string,
    changedTopicId: string,
    topicIdMap?: TopicIdMap,
  ): Promise<BrainMetricsDTO & { readonly impacts: readonly CognitiveImpactItem[] }> {
    const previous = await this.brainRepo.findCurrentByUser(userId)

    const questionsLast7Days = await this.answerRepo.countByUserLast7Days(userId)
    const energiaNeuralScore = calculateEnergiaNeuralScore(questionsLast7Days)

    const buildScore = async (topicId: string | undefined): Promise<number> => {
      if (!topicId) return 0
      const attempts = await this.answerRepo.findByUserAndTopic(userId, topicId)
      return calculateAccuracyScore(
        attempts.map((a) => ({
          isCorrect: a.isCorrect,
          daysAgo: (Date.now() - a.answeredAt.getTime()) / (1000 * 60 * 60 * 24),
        })),
      )
    }

    const [logicaScore, cienciasScore, interpretacaoScore, memoriaScore] = await Promise.all([
      buildScore(topicIdMap?.LOGICA),
      buildScore(topicIdMap?.CIENCIAS),
      buildScore(topicIdMap?.INTERPRETACAO),
      buildScore(topicIdMap?.MEMORIA),
    ])

    const estimatedScore = calculateEstimatedScore({
      logica: logicaScore / 100,
      ciencias: cienciasScore / 100,
      interpretacao: interpretacaoScore / 100,
      memoria: memoriaScore / 100,
    })

    const updated: BrainMetricsDTO = {
      energiaNeuralScore,
      logicaScore,
      cienciasScore,
      interpretacaoScore,
      memoriaScore,
      estimatedScore,
    }

    await this.brainRepo.upsert(userId, updated)

    const impacts = filterSignificantImpacts(this.buildImpacts(previous, updated))

    return { ...updated, impacts }
  }

  private buildImpacts(
    previous: BrainMetricsDTO | null,
    current: BrainMetricsDTO,
  ): readonly CognitiveImpactItem[] {
    if (!previous) return []

    const pairs: Array<[CognitiveAttribute, number, number]> = [
      [CognitiveAttribute.ENERGIA_NEURAL, previous.energiaNeuralScore, current.energiaNeuralScore],
      [CognitiveAttribute.LOGICA, previous.logicaScore, current.logicaScore],
      [CognitiveAttribute.CIENCIAS, previous.cienciasScore, current.cienciasScore],
      [CognitiveAttribute.INTERPRETACAO, previous.interpretacaoScore, current.interpretacaoScore],
      [CognitiveAttribute.MEMORIA, previous.memoriaScore, current.memoriaScore],
    ]

    return pairs.map(([attribute, prev, curr]) => ({
      attribute,
      delta: parseFloat((curr - prev).toFixed(2)),
    }))
  }

  async takeSnapshot(userId: string): Promise<void> {
    const metrics = await this.brainRepo.findCurrentByUser(userId)
    if (!metrics) return
    await this.brainRepo.takeSnapshot(userId, metrics)
  }

  async getHistory(userId: string, days: number): ReturnType<BrainRepository['findHistory']> {
    return this.brainRepo.findHistory(userId, days)
  }
}
