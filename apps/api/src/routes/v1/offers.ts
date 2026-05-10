import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireOwner } from '../../middleware/auth.js'

export async function offerRoutes(app: FastifyInstance) {
  // POST /offers — create (owner)
  app.post('/', { preHandler: requireOwner }, async (request, reply) => {
    const body = z.object({
      truckId: z.string(),
      code: z.string().min(3).toUpperCase(),
      discountType: z.enum(['FLAT', 'PERCENT']),
      discountValue: z.number().positive(),
      minOrderValue: z.number().default(0),
      maxUses: z.number().int().optional(),
      expiresAt: z.string().datetime().optional(),
    }).parse(request.body)

    const offer = await prisma.offer.create({
      data: { ...body, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null },
    })
    return reply.status(201).send({ success: true, data: offer })
  })

  // GET /offers/truck/:truckId — list active offers for a truck
  app.get('/truck/:truckId', async (request, reply) => {
    const { truckId } = request.params as { truckId: string }
    const offers = await prisma.offer.findMany({
      where: {
        truckId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })
    return reply.send({ success: true, data: offers })
  })

  // POST /offers/validate — validate code at checkout
  app.post('/validate', { preHandler: requireAuth }, async (request, reply) => {
    const { code, truckId, orderTotal } = z.object({
      code: z.string(),
      truckId: z.string(),
      orderTotal: z.number(),
    }).parse(request.body)

    const offer = await prisma.offer.findFirst({
      where: {
        code: code.toUpperCase(),
        truckId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    if (!offer) return reply.status(404).send({ success: false, message: 'Invalid or expired offer code' })
    if (orderTotal < offer.minOrderValue) {
      return reply.status(400).send({
        success: false,
        message: `Minimum order value is $${offer.minOrderValue}`,
      })
    }
    if (offer.maxUses !== null && offer.usedCount >= offer.maxUses) {
      return reply.status(400).send({ success: false, message: 'Offer usage limit reached' })
    }

    const discount =
      offer.discountType === 'FLAT'
        ? offer.discountValue
        : (orderTotal * offer.discountValue) / 100

    return reply.send({ success: true, data: { offer, discount } })
  })

  // GET /offers/:id/stats — usage stats (owner)
  app.get('/:id/stats', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const offer = await prisma.offer.findUnique({ where: { id } })
    if (!offer) return reply.status(404).send({ success: false, message: 'Offer not found' })

    const totalDiscount = await prisma.order.aggregate({
      where: { offerId: id },
      _sum: { discount: true },
    })

    return reply.send({
      success: true,
      data: { offer, totalRedemptions: offer.usedCount, totalDiscountGiven: totalDiscount._sum.discount ?? 0 },
    })
  })

  // PATCH /offers/:id — update (owner)
  app.patch('/:id', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z.object({ isActive: z.boolean().optional(), expiresAt: z.string().datetime().optional() }).parse(request.body)
    const offer = await prisma.offer.update({ where: { id }, data: body })
    return reply.send({ success: true, data: offer })
  })
}
