import { Router } from 'express'
import { exportMovementReportCsv, getMovementReport } from '../controllers/administration-movement-report.controller'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'

const router = Router()
router.use(authenticate, authorize('ADMIN_PARISH'), requireParish)
router.get('/:id', getMovementReport)
router.get('/:id/export/csv', exportMovementReportCsv)
export default router
