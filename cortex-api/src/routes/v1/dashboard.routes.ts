import type { FastifyPluginAsync } from 'fastify/types/plugin'
import { authenticate } from '../../middleware/authenticate'
import { DashboardService } from '../../services/dashboard.service'

interface DashboardRoutesOptions {
  readonly dashboardService: DashboardService
}

export const dashboardRoutes: FastifyPluginAsync<DashboardRoutesOptions> = async (fastify, opts) => {
  const { dashboardService } = opts

  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const data = await dashboardService.getDashboardData(request.userId)
    return reply.send(data)
  })
}
