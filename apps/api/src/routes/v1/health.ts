import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      return reply.send({ success: true, status: 'healthy', timestamp: new Date().toISOString() })
    } catch {
      return reply.status(503).send({ success: false, status: 'unhealthy' })
    }
  })
}
