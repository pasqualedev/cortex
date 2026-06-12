import { UserRepository } from '../repositories/user.repository'
import { BrainRepository } from '../repositories/brain.repository'
import { AnswerRepository } from '../repositories/answer.repository'

interface DashboardData {
  readonly user: {
    readonly name: string
    readonly level: number
    readonly xp: number
    readonly streakDays: number
  }
  readonly brainMetrics: {
    readonly energiaNeuralScore: number
    readonly memoriaScore: number
    readonly logicaScore: number
    readonly interpretacaoScore: number
    readonly cienciasScore: number
    readonly estimatedScore: number
  }
  readonly recentActivity: {
    readonly questionsThisWeek: number
    readonly correctThisWeek: number
    readonly sessionsThisWeek: number
  }
}

/** Assembles the home dashboard data for a user from multiple repositories. */
export class DashboardService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly brainRepo: BrainRepository,
    private readonly answerRepo: AnswerRepository,
  ) {}

  async getDashboardData(userId: string): Promise<DashboardData> {
    const [user, brainMetrics, questionsThisWeek] = await Promise.all([
      this.userRepo.findById(userId),
      this.brainRepo.findCurrentByUser(userId),
      this.answerRepo.countByUserLast7Days(userId),
    ])

    if (!user) throw Object.assign(new Error('Usuário não encontrado'), { code: 'NOT_FOUND' })

    return {
      user: {
        name: user.name,
        level: user.level,
        xp: user.xp,
        streakDays: user.streakDays,
      },
      brainMetrics: brainMetrics ?? {
        energiaNeuralScore: 0,
        memoriaScore: 0,
        logicaScore: 0,
        interpretacaoScore: 0,
        cienciasScore: 0,
        estimatedScore: 0,
      },
      recentActivity: {
        questionsThisWeek,
        correctThisWeek: 0,
        sessionsThisWeek: 0,
      },
    }
  }
}
