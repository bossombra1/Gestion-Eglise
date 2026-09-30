import { Router } from 'express'
import authRouter from './auth.routes'
import movementRouter from './movement.routes'
import registrationRouter from './registration.routes'
import paymentRouter from './payment.routes'
import documentRouter from './document.routes'
import communicationRouter from './communication.routes'
import administrationRouter from './administration.routes'
import administrationUserRouter from './administration-user.routes'
import administrationMovementRouter from './administration-movement.routes'
import administrationActivityRouter from './administration-activity.routes'
import administrationRegistrationRouter from './administration-registration.routes'
import administrationDocumentRouter from './administration-document.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'EcclesiaConnect API is running' })
})

router.use('/auth', authRouter)
router.use('/movements', movementRouter)
router.use('/registrations', registrationRouter)
router.use('/payments', paymentRouter)
router.use('/documents', documentRouter)
router.use('/communications', communicationRouter)
router.use('/administration', administrationRouter)
router.use('/administration/users', administrationUserRouter)
router.use('/administration/mouvements', administrationMovementRouter)
router.use('/administration/activite', administrationActivityRouter)
router.use('/administration/inscriptions', administrationRegistrationRouter)
router.use('/administration/documents', administrationDocumentRouter)

export default router
