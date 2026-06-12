import { AchievementRepository } from '../repositories/achievement.repository'
import { AnswerRepository } from '../repositories/answer.repository'

interface UserStateForAchievements {
  readonly userId: string
  readonly level: number
  readonly streakDays: number
  readonly totalAttempts: number
  readonly sessionCorrect: number
  readonly sessionTotal: number
  readonly logicaScore: number
}

/** Checks eligibility and unlocks achievements. Returns newly unlocked achievement IDs. */
export class AchievementService {
  constructor(
    private readonly achievementRepo: AchievementRepository,
    private readonly answerRepo: AnswerRepository,
  ) {}

  async checkAndUnlock(state: UserStateForAchievements): Promise<readonly string[]> {
    const [allAchievements, unlockedIds] = await Promise.all([
      this.achievementRepo.findAll(),
      this.achievementRepo.findUnlockedByUser(state.userId).then((ua) => ua.map((u) => u.achievementId)),
    ])

    const totalAttempts = await this.answerRepo.countByUser(state.userId)
    const newlyUnlocked: string[] = []

    for (const achievement of allAchievements) {
      if (unlockedIds.includes(achievement.id)) continue

      if (this.meetsThreshold(achievement, { ...state, totalAttempts })) {
        await this.achievementRepo.unlock(state.userId, achievement.id)
        newlyUnlocked.push(achievement.id)
      }
    }

    return newlyUnlocked
  }

  private meetsThreshold(
    achievement: { readonly id: string; readonly type: string; readonly threshold: number },
    state: UserStateForAchievements & { readonly totalAttempts: number },
  ): boolean {
    switch (achievement.type) {
      case 'SESSION': return achievement.threshold === 1
      case 'STREAK': return state.streakDays >= achievement.threshold
      case 'VOLUME': return state.totalAttempts >= achievement.threshold
      case 'LEVEL': return state.level >= achievement.threshold
      case 'PERFECT': return state.sessionCorrect === state.sessionTotal && state.sessionTotal >= 10
      case 'SKILL':
        if (achievement.id === 'logica-80') return state.logicaScore >= achievement.threshold
        return false
      default: return false
    }
  }
}
