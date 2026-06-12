import type { FastifyRequest } from 'fastify/types/request'
import type { FastifyReply } from 'fastify/types/reply'
import { verifyAccessToken } from '../utils/jwt'

/**
 * Fastify preHandler that verifies the Bearer token.
 * Sets request.userId if valid. Replies 401 if missing or invalid.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Token ausente' })
    return
  }

  const token = authHeader.slice(7)
  const userId = verifyAccessToken(token)

  if (!userId) {
    reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Token inválido ou expirado' })
    return
  }

  request.userId = userId
}
