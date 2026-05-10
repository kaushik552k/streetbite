import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireOwner, requireAdmin } from '../../middleware/auth.js'

const nearbySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().default(5),  // km
  cuisine: z.string().optional(),
  openNow: z.coerce.boolean().optional(),
})

export async function truckRoutes(app: FastifyInstance) {
  const listSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })

  // GET /trucks — list all approved trucks (no geo required, for dev)
  app.get('/', async (request, reply) => {
    const { page, limit } = listSchema.parse(request.query)
    const trucks = await prisma.foodTruck.findMany({
      where: { isApproved: true },
      select: {
        id: true,
        name: true,
        description: true,
        cuisine: true,
        logo: true,
        coverImage: true,
        isActive: true,
        address: true,
        lat: true,
        lng: true,
        createdAt: true,
        _count: { select: { reviews: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return reply.send({ success: true, data: trucks, meta: { page, limit } })
  })

  // GET /trucks/owner/me — get the signed-in owner's truck
  app.get('/owner/me', { preHandler: requireOwner }, async (request, reply) => {
    const truck = await prisma.foodTruck.findFirst({
      where: { ownerId: request.user!.id },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: { items: { orderBy: { name: 'asc' } } },
        },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { reviews: true, orders: true } },
      },
    })
    if (!truck) return reply.status(404).send({ success: false, message: 'No truck found for this owner' })
    return reply.send({ success: true, data: truck })
  })

  // GET /trucks/nearby — PostGIS geo search
  app.get('/nearby', { preHandler: requireAuth }, async (request, reply) => {
    const query = nearbySchema.safeParse(request.query)
    if (!query.success) return reply.status(400).send({ success: false, errors: query.error.flatten() })

    const { lat, lng, radius, cuisine, openNow } = query.data

    const trucks = await prisma.$queryRaw<any[]>`
      SELECT
        t.id, t.name, t.description, t.cuisine, t.logo, t."coverImage",
        t."isActive", t."isApproved",
        t.lat, t.lng, t.address,
        COALESCE(AVG(r.rating), 0)::float AS "avgRating",
        COUNT(DISTINCT r.id)::int AS "reviewCount",
        ST_Distance(
          ST_MakePoint(t.lng, t.lat)::geography,
          ST_MakePoint(${lng}, ${lat})::geography
        ) / 1000 AS "distanceKm"
      FROM "FoodTruck" t
      LEFT JOIN "Review" r ON r."truckId" = t.id
      WHERE
        t."isApproved" = true
        AND ST_DWithin(
          ST_MakePoint(t.lng, t.lat)::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radius * 1000}
        )
        ${cuisine ? prisma.$queryRaw`AND ${cuisine} = ANY(t.cuisine)` : prisma.$queryRaw``}
        ${openNow ? prisma.$queryRaw`AND t."isActive" = true` : prisma.$queryRaw``}
      GROUP BY t.id
      ORDER BY "distanceKm" ASC
      LIMIT 50
    `

    return reply.send({ success: true, data: trucks })
  })

  // GET /trucks/:id — truck detail + menu
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const truck = await prisma.foodTruck.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: { items: { where: { isAvailable: true }, orderBy: { name: 'asc' } } },
        },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { reviews: true, orders: true } },
      },
    })
    if (!truck) return reply.status(404).send({ success: false, message: 'Truck not found' })
    return reply.send({ success: true, data: truck })
  })

  // POST /trucks — create (owner)
  app.post('/', { preHandler: requireOwner }, async (request, reply) => {
    const schema = z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      cuisine: z.array(z.string()).min(1),
    })
    const body = schema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false, errors: body.error.flatten() })

    const truck = await prisma.foodTruck.create({
      data: { ...body.data, ownerId: request.user!.id },
    })
    return reply.status(201).send({ success: true, data: truck })
  })

  // PATCH /trucks/:id — update truck details (owner)
  app.patch('/:id', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const schema = z.object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      cuisine: z.array(z.string()).optional(),
      logo: z.string().url().optional(),
      coverImage: z.string().url().optional(),
      address: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    const body = schema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false, errors: body.error.flatten() })

    const truck = await prisma.foodTruck.findFirst({ where: { id, ownerId: request.user!.id } })
    if (!truck && request.user!.role !== 'ADMIN') {
      return reply.status(403).send({ success: false, message: 'Not your truck' })
    }

    const updated = await prisma.foodTruck.update({ where: { id }, data: body.data })
    return reply.send({ success: true, data: updated })
  })

  // PATCH /trucks/:id/status — toggle open/closed
  app.patch('/:id/status', { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { isActive } = z.object({ isActive: z.boolean() }).parse(request.body)

    const truck = await prisma.foodTruck.findFirst({ where: { id, ownerId: request.user!.id } })
    if (!truck && request.user!.role !== 'ADMIN') {
      return reply.status(403).send({ success: false, message: 'Not your truck' })
    }

    const updated = await prisma.foodTruck.update({ where: { id }, data: { isActive } })
    const io = (app as any).io
    if (io) io.to(`truck:${id}`).emit('truck:status', { isActive })

    return reply.send({ success: true, data: updated })
  })

  // GET /trucks/:id/reviews
  app.get('/:id/reviews', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { page = 1, limit = 10 } = request.query as any
    const skip = (Number(page) - 1) * Number(limit)

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { truckId: id },
        include: { customer: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.review.count({ where: { truckId: id } }),
    ])

    return reply.send({ success: true, data: reviews, meta: { total, page: Number(page), limit: Number(limit) } })
  })
}
