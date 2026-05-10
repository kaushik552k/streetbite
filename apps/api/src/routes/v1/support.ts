import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireOwner, requireAdmin } from '../../middleware/auth.js'

export async function supportRoutes(app: FastifyInstance) {
  // POST /support/tickets — create ticket (customer)
  app.post('/tickets', { preHandler: requireAuth }, async (request, reply) => {
    const body = z.object({
      truckId: z.string().optional(),
      subject: z.string().min(5),
      message: z.string().min(10),
    }).parse(request.body)

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: request.user!.id,
        truckId: body.truckId,
        subject: body.subject,
        messages: { create: { senderId: request.user!.id, body: body.message } },
      },
      include: { messages: true },
    })
    return reply.status(201).send({ success: true, data: ticket })
  })

  // GET /support/tickets — list (role filtered)
  app.get('/tickets', { preHandler: requireAuth }, async (request, reply) => {
    const { page = 1, limit = 20, status } = request.query as any
    const skip = (Number(page) - 1) * Number(limit)
    const user = request.user!

    const where: any = {}
    if (user.role === 'CUSTOMER') where.userId = user.id
    if (user.role === 'OWNER') {
      const truck = await prisma.foodTruck.findFirst({ where: { ownerId: user.id }, select: { id: true } })
      if (truck) where.truckId = truck.id
    }
    if (status) where.status = status

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          messages: { orderBy: { createdAt: 'asc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.supportTicket.count({ where }),
    ])

    return reply.send({ success: true, data: tickets, meta: { total } })
  })

  // GET /support/tickets/:id — full thread
  app.get('/tickets/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } }, user: { select: { name: true } } },
    })
    if (!ticket) return reply.status(404).send({ success: false, message: 'Ticket not found' })
    return reply.send({ success: true, data: ticket })
  })

  // POST /support/tickets/:id/reply
  app.post('/tickets/:id/reply', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { message } = z.object({ message: z.string().min(1) }).parse(request.body)

    const msg = await prisma.ticketMessage.create({
      data: { ticketId: id, senderId: request.user!.id, body: message },
    })
    await prisma.supportTicket.updateMany({ where: { id, status: 'OPEN' }, data: { status: 'IN_PROGRESS' } })

    return reply.status(201).send({ success: true, data: msg })
  })

  // PATCH /support/tickets/:id/status
  app.patch('/tickets/:id/status', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { status } = z.object({ status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']) }).parse(request.body)
    const ticket = await prisma.supportTicket.update({ where: { id }, data: { status } })
    return reply.send({ success: true, data: ticket })
  })
}
