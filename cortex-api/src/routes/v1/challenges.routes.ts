import type { FastifyPluginAsync } from 'fastify/types/plugin'
import { authenticate } from '../../middleware/authenticate'
import { challengeQuerySchema } from '../../validators/challenge.schema'
import { ChallengeService } from '../../services/challenge.service'

interface ChallengesRoutesOptions {
  readonly challengeService: ChallengeService
}

export const challengesRoutes: FastifyPluginAsync<ChallengesRoutesOptions> = async (fastify, opts) => {
  const { challengeService } = opts

  fastify.get('/next', { preHandler: authenticate }, async (request, reply) => {
    const query = challengeQuerySchema.safeParse(request.query)
    if (!query.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: query.error.flatten() })
    }
    try {
      const session = await challengeService.buildSession({
        userId: request.userId,
        ...(query.data.topicId !== undefined ? { topicId: query.data.topicId } : {}),
        ...(query.data.difficulty !== undefined ? { difficulty: query.data.difficulty } : {}),
      })
      return reply.send(session)
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'NOT_FOUND') return reply.code(404).send({ error: 'NOT_FOUND', message: e.message })
      throw err
    }
  })

  fastify.patch('/:id/complete', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await challengeService.completeChallenge(id, request.userId)
      return reply.send({ success: true })
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'NOT_FOUND') return reply.code(404).send({ error: 'NOT_FOUND', message: e.message })
      if (e.code === 'FORBIDDEN') return reply.code(403).send({ error: 'FORBIDDEN', message: e.message })
      throw err
    }
  })
}
