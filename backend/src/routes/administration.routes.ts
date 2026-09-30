import { Router } from 'express'
import { getDashboard } from '../controllers/administration.controller'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'

const router = Router()

router.use(authenticate, authorize('ADMIN_PARISH'), requireParish)

router.get('/dashboard', getDashboard)

export default router
