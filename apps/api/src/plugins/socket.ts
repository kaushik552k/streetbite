import type { Server, Socket } from 'socket.io'
import { clerkClient } from '@clerk/clerk-sdk-node'
import { prisma } from '../lib/prisma.js'

export function registerSocketIO(io: Server) {
  // Auth middleware for every socket connection
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined
      if (!token) return next(new Error('Authentication required'))

      const payload = await clerkClient.verifyToken(token)
      const user = await prisma.user.findUnique({
        where: { clerkId: payload.sub },
        select: { id: true, role: true },
      })

      if (!user) return next(new Error('User not found'))

      socket.data.userId = user.id
      socket.data.role = user.role
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const { userId, role } = socket.data

    // Customer joins their order room to track status
    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`)
    })

    socket.on('leave:order', (orderId: string) => {
      socket.leave(`order:${orderId}`)
    })

    // Owner joins their truck room to receive new orders
    socket.on('join:truck', (truckId: string) => {
      if (role === 'OWNER' || role === 'ADMIN') {
        socket.join(`truck:${truckId}`)
      }
    })

    socket.on('leave:truck', (truckId: string) => {
      socket.leave(`truck:${truckId}`)
    })

    socket.on('disconnect', () => {
      // socket.io handles cleanup automatically
    })
  })
}

// Helper to emit from routes
export function emitOrderNew(io: Server, truckId: string, order: unknown) {
  io.to(`truck:${truckId}`).emit('order:new', order)
}

export function emitOrderStatus(io: Server, orderId: string, data: { status: string; estimatedMins?: number }) {
  io.to(`order:${orderId}`).emit('order:status', data)
}

export function emitTruckStatus(io: Server, truckId: string, isActive: boolean) {
  io.to(`truck:${truckId}`).emit('truck:status', { isActive })
}
