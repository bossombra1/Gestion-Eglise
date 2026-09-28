import { Router } from 'express'
import authRouter from './auth.routes'
import movementRouter from './movement.routes'
import registrationRouter from './registration.routes'
import paymentRouter from './payment.routes'
import documentRouter from './document.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'EcclesiaConnect API is running',
  })
})

router.use('/auth', authRouter)
router.use('/movements', movementRouter)
router.use('/registrations', registrationRouter)
router.use('/payments', paymentRouter)
router.use('/documents', documentRouter)

export default router
