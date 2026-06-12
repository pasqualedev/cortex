import 'dotenv/config'
import FastifyFactory from 'fastify'
import type { FastifyInstance } from 'fastify/types/instance'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { config } from './config'
import { prisma } from './lib/prisma'
import { v1Routes } from './routes/v1'

type FastifyFactoryFn = (opts?: Record<string, unknown>) => FastifyInstance

/**
 * Builds and configures the Fastify server instance.
 * @returns Configured Fastify server ready to listen.
 */
async function buildServer(): Promise<FastifyInstance> {
  const fastify = (FastifyFactory as unknown as FastifyFactoryFn)({
    logger: {
      level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  })

  await fastify.register(cors, {
    origin: config.NODE_ENV === 'production' ? 'https://cortex.app' : true,
  })

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  await fastify.register(v1Routes, { prefix: '/v1', prisma })

  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return fastify
}

async function start(): Promise<void> {
  const server = await buildServer()
  try {
    await server.listen({ port: config.PORT, host: '0.0.0.0' })
    console.log(`Cortex API running on port ${config.PORT}`)
  } catch (err) {
    server.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()
