import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../middleware/auth.js'

export async function reviewRoutes(app: FastifyInstance) {
  // POST /reviews — submit after completed order
  app.post('/', { preHandler: requireAuth }, async (request, reply) => {
    const body = z.object({
      orderId: z.string(),
      truckId: z.string(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(500).optional(),
    }).parse(request.body)

    // Verify order belongs to customer and is completed
    const order = await prisma.order.findFirst({
      where: { id: body.orderId, customerId: request.user!.id, status: 'COMPLETED' },
    })
    if (!order) {
      return reply.status(400).send({ success: false, message: 'Order not found or not completed' })
    }

    // Check no existing review for this order
    const existing = await prisma.review.findUnique({ where: { orderId: body.orderId } })
    if (existing) {
      return reply.status(409).send({ success: false, message: 'You have already reviewed this order' })
    }

    const review = await prisma.review.create({
      data: { ...body, customerId: request.user!.id },
    })
    return reply.status(201).send({ success: true, data: review })
  })
}
