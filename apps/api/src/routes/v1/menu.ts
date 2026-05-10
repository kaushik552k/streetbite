import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { requireOwner } from '../../middleware/auth.js'

export async function menuRoutes(app: FastifyInstance) {
  // ── Categories ────────────────────────────────────────────

  app.post('/categories', { preHandler: requireOwner }, async (request, reply) => {
    const body = z.object({ truckId: z.string(), name: z.string().min(1), sortOrder: z.number().default(0) }).parse(request.body)
    const cat = await prisma.menuCategory.create({ data: body })
    return reply.status(201).send({ success: true, data: cat })
  })

  app.patch('/categories/:id', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z.object({ name: z.string().optional(), sortOrder: z.number().optional() }).parse(request.body)
    const cat = await prisma.menuCategory.update({ where: { id }, data: body })
    return reply.send({ success: true, data: cat })
  })

  app.delete('/categories/:id', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.menuCategory.delete({ where: { id } })
    return reply.send({ success: true })
  })

  // ── Items ─────────────────────────────────────────────────

  app.post('/items', { preHandler: requireOwner }, async (request, reply) => {
    const body = z.object({
      truckId: z.string(),
      categoryId: z.string().optional(),
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.number().positive(),
      image: z.string().url().optional(),
      isVeg: z.boolean().default(false),
      isAvailable: z.boolean().default(true),
    }).parse(request.body)

    const item = await prisma.menuItem.create({ data: body })
    return reply.status(201).send({ success: true, data: item })
  })

  app.patch('/items/:id', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      image: z.string().url().optional().nullable(),
      isVeg: z.boolean().optional(),
      isAvailable: z.boolean().optional(),
      categoryId: z.string().optional().nullable(),
    }).parse(request.body)

    const item = await prisma.menuItem.update({ where: { id }, data: body })
    return reply.send({ success: true, data: item })
  })

  app.delete('/items/:id', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.menuItem.delete({ where: { id } })
    return reply.send({ success: true })
  })

  // Bulk toggle availability for all items in a category
  app.patch('/categories/:id/bulk-availability', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { isAvailable } = z.object({ isAvailable: z.boolean() }).parse(request.body)
    await prisma.menuItem.updateMany({ where: { categoryId: id }, data: { isAvailable } })
    return reply.send({ success: true })
  })
}
