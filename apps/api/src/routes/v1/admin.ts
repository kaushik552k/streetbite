import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { requireAdmin } from '../../middleware/auth.js'

export async function adminRoutes(app: FastifyInstance) {
  // GET /admin/trucks/pending
  app.get('/trucks/pending', { preHandler: requireAdmin }, async (_req, reply) => {
    const trucks = await prisma.foodTruck.findMany({
      where: { isApproved: false },
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return reply.send({ success: true, data: trucks })
  })

  // GET /admin/trucks
  app.get('/trucks', { preHandler: requireAdmin }, async (request, reply) => {
    const { page = 1, limit = 20 } = request.query as any
    const skip = (Number(page) - 1) * Number(limit)
    const [trucks, total] = await Promise.all([
      prisma.foodTruck.findMany({
        include: { owner: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: Number(limit),
      }),
      prisma.foodTruck.count(),
    ])
    return reply.send({ success: true, data: trucks, meta: { total } })
  })

  // PATCH /admin/trucks/:id/approve
  app.patch('/trucks/:id/approve', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { approved, reason } = z.object({ approved: z.boolean(), reason: z.string().optional() }).parse(request.body)
    const truck = await prisma.foodTruck.update({ where: { id }, data: { isApproved: approved } })
    return reply.send({ success: true, data: truck })
  })

  // PATCH /admin/trucks/:id/commission
  app.patch('/trucks/:id/commission', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { commission } = z.object({ commission: z.number().min(0).max(100) }).parse(request.body)
    const truck = await prisma.foodTruck.update({ where: { id }, data: { commission } })
    return reply.send({ success: true, data: truck })
  })

  // GET /admin/users
  app.get('/users', { preHandler: requireAdmin }, async (request, reply) => {
    const { page = 1, limit = 20, role } = request.query as any
    const skip = (Number(page) - 1) * Number(limit)
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: role ? { role } : {},
        orderBy: { createdAt: 'desc' },
        skip, take: Number(limit),
      }),
      prisma.user.count({ where: role ? { role } : {} }),
    ])
    return reply.send({ success: true, data: users, meta: { total } })
  })

  // GET /admin/analytics
  app.get('/analytics', { preHandler: requireAdmin }, async (_req, reply) => {
    const [totalOrders, totalGMV, totalTrucks, totalUsers] = await Promise.all([
      prisma.order.count({ where: { paymentStatus: 'PAID' } }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
      prisma.foodTruck.count({ where: { isApproved: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ])
    return reply.send({
      success: true,
      data: {
        totalOrders,
        totalGMV: totalGMV._sum.total ?? 0,
        totalTrucks,
        totalUsers,
      },
    })
  })
}
