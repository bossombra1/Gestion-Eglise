import { Router } from 'express'
import { listUsers } from '../controllers/administration-user.controller'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'

const router = Router()
router.use(authenticate, authorize('ADMIN_PARISH'), requireParish)
router.get('/', listUsers)
export default router
