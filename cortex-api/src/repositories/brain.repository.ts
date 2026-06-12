import { PrismaClient, BrainMetrics, BrainSnapshot } from '@prisma/client'
import { BrainMetricsDTO } from '../types/domain.types'

function toBrainMetricsDTO(m: BrainMetrics): BrainMetricsDTO {
  return {
    energiaNeuralScore: m.energiaNeuralScore,
    memoriaScore: m.memoriaScore,
    logicaScore: m.logicaScore,
    interpretacaoScore: m.interpretacaoScore,
    cienciasScore: m.cienciasScore,
    estimatedScore: m.estimatedScore,
  }
}

/** Repository for BrainMetrics and BrainSnapshot models. */
export class BrainRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findCurrentByUser(userId: string): Promise<BrainMetricsDTO | null> {
    const metrics = await this.prisma.brainMetrics.findUnique({ where: { userId } })
    return metrics ? toBrainMetricsDTO(metrics) : null
  }

  async upsert(userId: string, data: BrainMetricsDTO): Promise<BrainMetricsDTO> {
    const metrics = await this.prisma.brainMetrics.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })
    return toBrainMetricsDTO(metrics)
  }

  async takeSnapshot(userId: string, metrics: BrainMetricsDTO): Promise<void> {
    await this.prisma.brainSnapshot.create({
      data: { userId, ...metrics },
    })
  }

  async findHistory(userId: string, days: number): Promise<readonly BrainSnapshot[]> {
    const since = new Date()
    since.setDate(since.getDate() - days)
    return this.prisma.brainSnapshot.findMany({
      where: { userId, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
    })
  }
}
