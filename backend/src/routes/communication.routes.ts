import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'
import { createCommunication, getCommunications } from '../controllers/communication.controller'

const router = Router()

router.use(authenticate, authorize('MOVEMENT_MANAGER'), requireParish)
router.get('/', getCommunications)
router.post('/', createCommunication)

export default router
