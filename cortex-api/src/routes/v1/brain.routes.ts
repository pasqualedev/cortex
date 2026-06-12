import type { FastifyPluginAsync } from 'fastify/types/plugin'
import { authenticate } from '../../middleware/authenticate'
import { BrainService } from '../../services/brain.service'
import { BrainRepository } from '../../repositories/brain.repository'

interface BrainRoutesOptions {
  readonly brainService: BrainService
  readonly brainRepo: BrainRepository
}

export const brainRoutes: FastifyPluginAsync<BrainRoutesOptions> = async (fastify, opts) => {
  const { brainRepo } = opts

  fastify.get('/current', { preHandler: authenticate }, async (request, reply) => {
    const metrics = await brainRepo.findCurrentByUser(request.userId)
    return reply.send(metrics ?? {
      energiaNeuralScore: 0,
      memoriaScore: 0,
      logicaScore: 0,
      interpretacaoScore: 0,
      cienciasScore: 0,
      estimatedScore: 0,
    })
  })

  fastify.get('/history', { preHandler: authenticate }, async (request, reply) => {
    const { days = '30' } = request.query as { days?: string }
    const daysInt = Math.min(365, Math.max(1, parseInt(days, 10)))
    const snapshots = await brainRepo.findHistory(request.userId, daysInt)
    return reply.send({ snapshots })
  })
}
