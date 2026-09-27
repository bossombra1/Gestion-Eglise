import { Router } from 'express'
import authRouter from './auth.routes'
import movementRouter from './movement.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'EcclesiaConnect API is running',
  })
})

router.use('/auth', authRouter)
router.use('/movements', movementRouter)

export default router
