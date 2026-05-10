import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import Stripe from 'stripe'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireOwner } from '../../middleware/auth.js'
import { env } from '../../lib/env.js'
import { emitOrderNew, emitOrderStatus } from '../../plugins/socket.js'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

const ORDER_STATUS = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as const

export async function orderRoutes(app: FastifyInstance) {
  // POST /orders — create order + Stripe PaymentIntent
  app.post('/', { preHandler: requireAuth }, async (request, reply) => {
    const body = z.object({
      truckId: z.string(),
      items: z.array(z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive(),
        customNote: z.string().optional(),
      })).min(1),
      offerId: z.string().optional(),
      note: z.string().optional(),
    }).parse(request.body)

    // Validate truck is open and approved
    const truck = await prisma.foodTruck.findUnique({
      where: { id: body.truckId },
      select: { id: true, isApproved: true, isActive: true, commission: true },
    })
    if (!truck?.isApproved || !truck.isActive) {
      return reply.status(400).send({ success: false, message: 'Truck is not available for orders' })
    }

    // Fetch menu items and calculate subtotal
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: body.items.map((i) => i.menuItemId) }, truckId: body.truckId, isAvailable: true },
    })

    if (menuItems.length !== body.items.length) {
      return reply.status(400).send({ success: false, message: 'One or more items are unavailable' })
    }

    const itemsMap = new Map(menuItems.map((m) => [m.id, m]))
    let subtotal = 0
    const orderItems = body.items.map((i) => {
      const item = itemsMap.get(i.menuItemId)!
      subtotal += item.price * i.quantity
      return { menuItemId: i.menuItemId, quantity: i.quantity, unitPrice: item.price, customNote: i.customNote }
    })

    // Apply offer if provided
    let discount = 0
    if (body.offerId) {
      const offer = await prisma.offer.findFirst({
        where: { id: body.offerId, truckId: body.truckId, isActive: true },
      })
      if (offer && subtotal >= offer.minOrderValue) {
        discount = offer.discountType === 'FLAT'
          ? offer.discountValue
          : (subtotal * offer.discountValue) / 100
        if (offer.maxUses !== null) {
          await prisma.offer.update({ where: { id: offer.id }, data: { usedCount: { increment: 1 } } })
        }
      }
    }

    const commissionPct = truck.commission
    const total = Math.max(0, subtotal - discount)
    const commissionAmount = (total * commissionPct) / 100

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // cents
      currency: 'usd',
      metadata: { truckId: body.truckId, customerId: request.user!.id },
    })

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        customerId: request.user!.id,
        truckId: body.truckId,
        subtotal,
        discount,
        commission: commissionAmount,
        total,
        stripePaymentId: paymentIntent.id,
        offerId: body.offerId,
        note: body.note,
        items: { create: orderItems },
      },
      include: {
        items: { include: { menuItem: { select: { name: true } } } },
        customer: { select: { name: true } },
      },
    })

    // Notify truck owner via Socket.IO
    const io = (app as any).io
    if (io) emitOrderNew(io, body.truckId, order)

    return reply.status(201).send({
      success: true,
      data: { order, clientSecret: paymentIntent.client_secret },
    })
  })

  // GET /orders — list (role-filtered)
  app.get('/', { preHandler: requireAuth }, async (request, reply) => {
    const { page = 1, limit = 20, status } = request.query as any
    const skip = (Number(page) - 1) * Number(limit)
    const user = request.user!

    const where: any = {}
    if (user.role === 'CUSTOMER') where.customerId = user.id
    if (user.role === 'OWNER') {
      const truck = await prisma.foodTruck.findFirst({ where: { ownerId: user.id }, select: { id: true } })
      if (truck) where.truckId = truck.id
    }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { menuItem: { select: { name: true, image: true } } } },
          truck: { select: { name: true, logo: true } },
          customer: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ])

    return reply.send({ success: true, data: orders, meta: { total, page: Number(page), limit: Number(limit) } })
  })

  // GET /orders/:id — detail
  app.get('/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
        truck: { select: { name: true, logo: true, address: true } },
        customer: { select: { name: true, phone: true } },
        review: true,
      },
    })
    if (!order) return reply.status(404).send({ success: false, message: 'Order not found' })
    return reply.send({ success: true, data: order })
  })

  // PATCH /orders/:id/status — update by owner
  app.patch('/:id/status', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z.object({
      status: z.enum(ORDER_STATUS),
      estimatedMins: z.number().optional(),
    }).parse(request.body)

    const order = await prisma.order.update({
      where: { id },
      data: { status: body.status, ...(body.estimatedMins && { estimatedMins: body.estimatedMins }) },
    })

    const io = (app as any).io
    if (io) emitOrderStatus(io, id, { status: body.status, estimatedMins: body.estimatedMins })

    return reply.send({ success: true, data: order })
  })
}
