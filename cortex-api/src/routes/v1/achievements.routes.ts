import type { FastifyPluginAsync } from 'fastify/types/plugin'
import { authenticate } from '../../middleware/authenticate'
import { AchievementRepository } from '../../repositories/achievement.repository'

interface AchievementsRoutesOptions {
  readonly achievementRepo: AchievementRepository
}

export const achievementsRoutes: FastifyPluginAsync<AchievementsRoutesOptions> = async (fastify, opts) => {
  const { achievementRepo } = opts

  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const [all, unlocked] = await Promise.all([
      achievementRepo.findAll(),
      achievementRepo.findUnlockedByUser(request.userId),
    ])

    const unlockedIds = new Set(unlocked.map((u) => u.achievementId))

    return reply.send({
      unlocked: unlocked.map((u) => ({
        id: u.achievementId,
        name: u.achievement.name,
        description: u.achievement.description,
        icon: u.achievement.icon,
        unlockedAt: u.unlockedAt.toISOString(),
      })),
      locked: all
        .filter((a) => !unlockedIds.has(a.id))
        .map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          progress: 0,
          threshold: a.threshold,
        })),
    })
  })
}
