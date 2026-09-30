import {Router} from 'express'
import {getRegistrations} from '../controllers/administration-registration.controller'
import {authenticate} from '../middlewares/authenticate.middleware'
import {authorize} from '../middlewares/authorize.middleware'
import {requireParish} from '../middlewares/parish.middleware'
const router=Router()
router.use(authenticate,authorize('ADMIN_PARISH'),requireParish)
router.get('/',getRegistrations)
export default router
