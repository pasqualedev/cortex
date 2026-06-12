import type { FastifyPluginAsync } from 'fastify/types/plugin'
import { registerSchema, loginSchema, refreshSchema } from '../../validators/auth.schema'
import { AuthService } from '../../services/auth.service'

interface AuthRoutesOptions {
  readonly authService: AuthService
}

export const authRoutes: FastifyPluginAsync<AuthRoutesOptions> = async (fastify, opts) => {
  const { authService } = opts

  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    try {
      const result = await authService.register(body.data)
      return reply.code(201).send(result)
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'CONFLICT') return reply.code(409).send({ error: 'CONFLICT', message: e.message })
      throw err
    }
  })

  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    try {
      const result = await authService.login(body.data)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'UNAUTHORIZED') return reply.code(401).send({ error: 'UNAUTHORIZED', message: e.message })
      throw err
    }
  })

  fastify.post('/refresh', async (request, reply) => {
    const body = refreshSchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: body.error.flatten() })
    }
    try {
      const tokens = authService.refresh(body.data.refreshToken)
      return reply.send(tokens)
    } catch {
      return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Refresh token inválido' })
    }
  })

  fastify.delete('/logout', async (_request, reply) => {
    return reply.code(204).send()
  })
}
