import { PrismaClient, Achievement, UserAchievement } from '@prisma/client'

/** Repository for Achievement and UserAchievement models. */
export class AchievementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({ orderBy: { threshold: 'asc' } })
  }

  async findUnlockedByUser(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    })
  }

  async unlock(userId: string, achievementId: string): Promise<void> {
    await this.prisma.userAchievement.create({ data: { userId, achievementId } })
  }

  async isUnlocked(userId: string, achievementId: string): Promise<boolean> {
    const ua = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
      select: { id: true },
    })
    return ua !== null
  }
}
