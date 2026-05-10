import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CLERK_SECRET_KEY: z.string().default('sk_test_dummy'),
  CLERK_WEBHOOK_SECRET: z.string().default('whsec_dummy'),
  STRIPE_SECRET_KEY: z.string().default('sk_test_dummy'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_dummy'),
  CLOUDINARY_CLOUD_NAME: z.string().default('dummy'),
  CLOUDINARY_API_KEY: z.string().default('dummy'),
  CLOUDINARY_API_SECRET: z.string().default('dummy'),
  RESEND_API_KEY: z.string().default('re_dummy'),
  TWILIO_ACCOUNT_SID: z.string().default('AC_dummy'),
  TWILIO_AUTH_TOKEN: z.string().default('dummy'),
  TWILIO_PHONE_NUMBER: z.string().default('dummy'),
  GOOGLE_MAPS_API_KEY: z.string().default('dummy'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001'),
  SENTRY_DSN: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
