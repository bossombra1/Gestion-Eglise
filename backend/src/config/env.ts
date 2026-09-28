import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(16).optional(),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
})

const parsed = envSchema.parse(process.env)

if (parsed.NODE_ENV === 'production') {
  if (!parsed.DATABASE_URL) throw new Error('DATABASE_URL est obligatoire en production.')
  if (!parsed.JWT_SECRET) throw new Error('JWT_SECRET est obligatoire en production.')
}

export const env = parsed
