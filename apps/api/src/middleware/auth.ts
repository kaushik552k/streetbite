import type { FastifyRequest, FastifyReply } from 'fastify'
import { clerkClient } from '@clerk/clerk-sdk-node'
import { prisma } from '../lib/prisma.js'

export interface AuthUser {
  id: string
  clerkId: string
  role: 'CUSTOMER' | 'OWNER' | 'ADMIN'
  email: string
  name: string
}

// Extracts and verifies Clerk JWT, attaches user to request
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ success: false, message: 'Missing authorization header' })
    }

    const token = authHeader.slice(7)

    // 🔥 DEV MODE BYPASS — Only active when DEV_BYPASS_TOKEN is set in .env
    // Use different tokens per portal role:
    //   dev_bypass        → CUSTOMER (mobile app)
    //   dev_bypass_owner  → OWNER    (owner portal)
    //   dev_bypass_admin  → ADMIN    (admin portal)
    if (process.env.DEV_BYPASS_TOKEN) {
      let role: 'CUSTOMER' | 'OWNER' | 'ADMIN' | null = null
      if (token === process.env.DEV_BYPASS_TOKEN) role = 'CUSTOMER'
      else if (token === `${process.env.DEV_BYPASS_TOKEN}_owner`) role = 'OWNER'
      else if (token === `${process.env.DEV_BYPASS_TOKEN}_admin`) role = 'ADMIN'

      if (role) {
        const devUser = await prisma.user.findFirst({
          where: { role },
          select: { id: true, clerkId: true, role: true, email: true, name: true },
        })
        if (devUser) {
          request.user = devUser as AuthUser
          return
        }
      }
    }

    const payload = await clerkClient.verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
      select: { id: true, clerkId: true, role: true, email: true, name: true },
    })

    if (!user) {
      return reply.status(401).send({ success: false, message: 'User not found. Please sign in again.' })
    }

    request.user = user as AuthUser
  } catch {
    return reply.status(401).send({ success: false, message: 'Invalid or expired token' })
  }
}

// Guard: requires any authenticated user
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply)
}

// Guard: requires OWNER or ADMIN role
export async function requireOwner(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply)
  if (request.user && !['OWNER', 'ADMIN'].includes(request.user.role)) {
    return reply.status(403).send({ success: false, message: 'Truck owner access required' })
  }
}

// Guard: requires ADMIN role
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply)
  if (request.user && request.user.role !== 'ADMIN') {
    return reply.status(403).send({ success: false, message: 'Admin access required' })
  }
}

// Augment FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser
  }
}
