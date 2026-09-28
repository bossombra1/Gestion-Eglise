import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import apiRouter from './routes'
import { errorMiddleware } from './middlewares/error.middleware'
import { env } from './config/env'

const app = express()

const allowedOrigins = new Set(
  env.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
)

app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true)
      return callback(new Error('Origine CORS non autorisée.'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

app.use('/api', apiRouter)
app.use(errorMiddleware)

export default app
