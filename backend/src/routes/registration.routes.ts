import { Router } from 'express'
import {
  approveRegistration,
  getRegistrations,
  rejectRegistration,
} from '../controllers/registration.controller'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'

const router = Router()

router.use(authenticate, authorize('MOVEMENT_MANAGER'), requireParish)

router.get('/me', getRegistrations)
router.patch('/:id/approve', approveRegistration)
router.patch('/:id/reject', rejectRegistration)

export default router
