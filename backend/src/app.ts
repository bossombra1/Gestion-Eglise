import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import apiRouter from './routes'
import { errorMiddleware } from './middlewares/error.middleware'

const app = express()

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', apiRouter)
app.use(errorMiddleware)

export default app
