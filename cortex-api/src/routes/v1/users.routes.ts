import type { FastifyPluginAsync } from 'fastify/types/plugin'
import { authenticate } from '../../middleware/authenticate'
import { updateUserSchema, onboardingSchema } from '../../validators/user.schema'
import { UserRepository } from '../../repositories/user.repository'
import { BrainRepository } from '../../repositories/brain.repository'

interface UsersRoutesOptions {
  readonly userRepo: UserRepository
  readonly brainRepo: BrainRepository
}

export const usersRoutes: FastifyPluginAsync<UsersRoutesOptions> = async (fastify, opts) => {
  const { userRepo, brainRepo } = opts

  fastify.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const user = await userRepo.findById(request.userId)
    if (!user) return reply.code(404).send({ error: 'NOT_FOUND', message: 'Usuário não encontrado' })
    return reply.send(userRepo.toDTO(user))
  })

  fastify.patch('/me', { preHandler: authenticate }, async (request, reply) => {
    const body = updateUserSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    const updateData = Object.fromEntries(
      Object.entries(body.data).filter(([, v]) => v !== undefined),
    ) as Parameters<typeof userRepo.update>[1]
    await userRepo.update(request.userId, updateData)
    const updated = await userRepo.findById(request.userId)
    if (!updated) return reply.code(404).send({ error: 'NOT_FOUND', message: 'Usuário não encontrado' })
    return reply.send(userRepo.toDTO(updated))
  })

  fastify.post('/me/onboarding', { preHandler: authenticate }, async (request, reply) => {
    const body = onboardingSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    await userRepo.upsertGoal(request.userId, body.data.targetScore)
    await brainRepo.upsert(request.userId, {
      energiaNeuralScore: 0,
      memoriaScore: 0,
      logicaScore: 0,
      interpretacaoScore: 0,
      cienciasScore: 0,
      estimatedScore: 0,
    })
    return reply.code(201).send({ goal: { targetScore: body.data.targetScore } })
  })
}
