import type { FastifyPluginAsync } from 'fastify/types/plugin'
import { authenticate } from '../../middleware/authenticate'
import { submitAnswerSchema } from '../../validators/answer.schema'
import { AnswerService } from '../../services/answer.service'

interface AnswersRoutesOptions {
  readonly answerService: AnswerService
}

export const answersRoutes: FastifyPluginAsync<AnswersRoutesOptions> = async (fastify, opts) => {
  const { answerService } = opts

  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const body = submitAnswerSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    try {
      const result = await answerService.submitAnswer({
        userId: request.userId,
        ...body.data,
      })
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'NOT_FOUND') return reply.code(404).send({ error: 'NOT_FOUND', message: e.message })
      if (e.code === 'CONFLICT') return reply.code(409).send({ error: 'CONFLICT', message: e.message })
      throw err
    }
  })
}
