import Fastify from 'fastify'
import { Server } from 'socket.io'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { logger } from './lib/logger.js'
import { env } from './lib/env.js'
import { prisma } from './lib/prisma.js'
import { registerSocketIO } from './plugins/socket.js'
import { healthRoutes } from './routes/v1/health.js'
import { webhookRoutes } from './routes/v1/webhooks.js'
import { truckRoutes } from './routes/v1/trucks.js'
import { menuRoutes } from './routes/v1/menu.js'
import { orderRoutes } from './routes/v1/orders.js'
import { offerRoutes } from './routes/v1/offers.js'
import { reviewRoutes } from './routes/v1/reviews.js'
import { supportRoutes } from './routes/v1/support.js'
import { adminRoutes } from './routes/v1/admin.js'

const app = Fastify({
  logger: logger,
  trustProxy: true,
})

// ── Plugins ──────────────────────────────────────────────
await app.register(helmet, { global: true })

const corsOrigin =
  env.NODE_ENV === 'development'
    ? true
    : Array.from(
        new Set(
          env.CORS_ORIGINS.split(',')
            .map((o) => o.trim())
            .filter((o) => o !== '' && o !== 'true' && o !== 'false')
        )
      )

await app.register(cors, {
  origin: corsOrigin,
  credentials: true,
})

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  skipOnError: true,
})

// ── Socket.IO ─────────────────────────────────────────────
const io = new Server(app.server, {
  cors: { origin: corsOrigin, credentials: true },
})
registerSocketIO(io)
app.decorate('io', io)

// ── Routes ────────────────────────────────────────────────
app.get('/', async () => {
  return {
    service: 'StreetBite API',
    status: 'running',
    version: '1.0.0',
    message: 'Welcome to the StreetBite API! 🚀'
  }
})

await app.register(healthRoutes, { prefix: '/health' })
await app.register(webhookRoutes, { prefix: '/webhooks' })
await app.register(truckRoutes, { prefix: '/api/v1/trucks' })
await app.register(menuRoutes, { prefix: '/api/v1/menu' })
await app.register(orderRoutes, { prefix: '/api/v1/orders' })
await app.register(offerRoutes, { prefix: '/api/v1/offers' })
await app.register(reviewRoutes, { prefix: '/api/v1/reviews' })
await app.register(supportRoutes, { prefix: '/api/v1/support' })
await app.register(adminRoutes, { prefix: '/api/v1/admin' })

// ── Global error handler ──────────────────────────────────
app.setErrorHandler((error, _request, reply) => {
  app.log.error(error)
  const statusCode = error.statusCode ?? 500
  reply.status(statusCode).send({
    success: false,
    message: error.message ?? 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  })
})

// ── Start ─────────────────────────────────────────────────
const start = async () => {
  try {
    await prisma.$connect()
    app.log.info('✅ Database connected')
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    
    // Print a clean, clickable message to the terminal
    console.log('\n=========================================')
    console.log('🚀 StreetBite API is up and running!')
    console.log(`🌐 Local URL: http://localhost:${env.PORT}`)
    console.log(`🏥 Health Check: http://localhost:${env.PORT}/health`)
    console.log('=========================================\n')

    app.log.info(`Server running on port ${env.PORT}`)
  } catch (err) {
    app.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()
