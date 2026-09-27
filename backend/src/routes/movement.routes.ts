import { Router } from 'express'
import {
  getChildren,
  getDashboard,
  getMyMovements,
  getParents,
} from '../controllers/movement.controller'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'

const router = Router()

router.use(authenticate, authorize('MOVEMENT_MANAGER'), requireParish)

router.get('/me', getMyMovements)
router.get('/me/dashboard', getDashboard)
router.get('/me/children', getChildren)
router.get('/me/parents', getParents)

export default router
