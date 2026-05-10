import type { FastifyInstance, FastifyRequest } from 'fastify'
import { Webhook } from 'svix'
import Stripe from 'stripe'
import { prisma } from '../../lib/prisma.js'
import { env } from '../../lib/env.js'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function webhookRoutes(app: FastifyInstance) {
  // ── Clerk User Sync ────────────────────────────────────────
  app.post('/clerk', {
    config: { rawBody: true },
  }, async (request: FastifyRequest, reply) => {
    const svix = new Webhook(env.CLERK_WEBHOOK_SECRET)
    const body = (request as any).rawBody as string

    let event: any
    try {
      event = svix.verify(body, {
        'svix-id': request.headers['svix-id'] as string,
        'svix-timestamp': request.headers['svix-timestamp'] as string,
        'svix-signature': request.headers['svix-signature'] as string,
      })
    } catch {
      return reply.status(400).send({ success: false, message: 'Invalid webhook signature' })
    }

    const { type, data } = event

    if (type === 'user.created' || type === 'user.updated') {
      const email = data.email_addresses?.[0]?.email_address ?? ''
      const name = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim()
      const phone = data.phone_numbers?.[0]?.phone_number ?? null
      const avatar = data.image_url ?? null

      await prisma.user.upsert({
        where: { clerkId: data.id },
        create: { clerkId: data.id, email, name, phone, avatar },
        update: { email, name, phone, avatar },
      })
    }

    if (type === 'user.deleted') {
      await prisma.user.deleteMany({ where: { clerkId: data.id } })
    }

    return reply.send({ success: true })
  })

  // ── Stripe Payment Confirmation ────────────────────────────
  app.post('/stripe', {
    config: { rawBody: true },
  }, async (request: FastifyRequest, reply) => {
    const sig = request.headers['stripe-signature'] as string
    const body = (request as any).rawBody as string

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET)
    } catch {
      return reply.status(400).send({ success: false, message: 'Invalid Stripe signature' })
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent
      await prisma.order.updateMany({
        where: { stripePaymentId: pi.id },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      })
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent
      await prisma.order.updateMany({
        where: { stripePaymentId: pi.id },
        data: { paymentStatus: 'UNPAID', status: 'CANCELLED' },
      })
    }

    return reply.send({ success: true })
  })
}
