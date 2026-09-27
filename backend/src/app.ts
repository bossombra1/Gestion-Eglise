import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()

app.use(helmet())

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'EcclesiaConnect API is running',
  })
})

export default app
