import type { FastifyPluginAsync } from 'fastify/types/plugin'
import { PrismaClient } from '@prisma/client'
import { authRoutes } from './auth.routes'
import { usersRoutes } from './users.routes'
import { challengesRoutes } from './challenges.routes'
import { answersRoutes } from './answers.routes'
import { brainRoutes } from './brain.routes'
import { dashboardRoutes } from './dashboard.routes'
import { achievementsRoutes } from './achievements.routes'
import { UserRepository } from '../../repositories/user.repository'
import { QuestionRepository } from '../../repositories/question.repository'
import { AnswerRepository } from '../../repositories/answer.repository'
import { BrainRepository } from '../../repositories/brain.repository'
import { AchievementRepository } from '../../repositories/achievement.repository'
import { AuthService } from '../../services/auth.service'
import { ChallengeService } from '../../services/challenge.service'
import { AnswerService } from '../../services/answer.service'
import { BrainService } from '../../services/brain.service'
import { DashboardService } from '../../services/dashboard.service'
import { AchievementService } from '../../services/achievement.service'

export const v1Routes: FastifyPluginAsync<{ prisma: PrismaClient }> = async (fastify, opts) => {
  const { prisma } = opts

  const userRepo = new UserRepository(prisma)
  const questionRepo = new QuestionRepository(prisma)
  const answerRepo = new AnswerRepository(prisma)
  const brainRepo = new BrainRepository(prisma)
  const achievementRepo = new AchievementRepository(prisma)

  const brainService = new BrainService(brainRepo, answerRepo)
  const achievementService = new AchievementService(achievementRepo, answerRepo)
  const authService = new AuthService(userRepo)
  const answerService = new AnswerService(answerRepo, questionRepo, userRepo, brainService, achievementService, prisma)
  const challengeService = new ChallengeService(questionRepo, brainService, prisma)
  const dashboardService = new DashboardService(userRepo, brainRepo, answerRepo)

  await fastify.register(authRoutes, { prefix: '/auth', authService })
  await fastify.register(usersRoutes, { prefix: '/users', userRepo, brainRepo })
  await fastify.register(challengesRoutes, { prefix: '/challenges', challengeService })
  await fastify.register(answersRoutes, { prefix: '/answers', answerService })
  await fastify.register(brainRoutes, { prefix: '/brain', brainService, brainRepo })
  await fastify.register(dashboardRoutes, { prefix: '/dashboard', dashboardService })
  await fastify.register(achievementsRoutes, { prefix: '/achievements', achievementRepo })
}
