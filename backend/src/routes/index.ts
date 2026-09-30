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
import administrationMovementReportRouter from './administration-movement-report.routes'
import administrationActivityRouter from './administration-activity.routes'
import administrationRegistrationRouter from './administration-registration.routes'
import administrationDocumentRouter from './administration-document.routes'
import administrationOverviewRouter from './administration-overview.routes'
import administrationSacramentalRouter from './administration-sacramental.routes'
import administrationBannsRouter from './administration-banns.routes'
const router = Router()
router.get('/health', (_req, res) => res.json({ success: true, message: 'EcclesiaConnect API is running' }))
router.use('/auth', authRouter)
router.use('/movements', movementRouter)
router.use('/registrations', registrationRouter)
router.use('/payments', paymentRouter)
router.use('/documents', documentRouter)
router.use('/communications', communicationRouter)
router.use('/administration', administrationRouter)
router.use('/administration/users', administrationUserRouter)
router.use('/administration/mouvements', administrationMovementRouter)
router.use('/administration/mouvements', administrationMovementReportRouter)
router.use('/administration/activite', administrationActivityRouter)
router.use('/administration/inscriptions', administrationRegistrationRouter)
router.use('/administration/documents', administrationDocumentRouter)
router.use('/administration/overview', administrationOverviewRouter)
router.use('/administration/sacramental', administrationSacramentalRouter)
router.use('/administration/banns', administrationBannsRouter)
export default router
