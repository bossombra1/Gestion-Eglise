import {Router} from 'express'
import {getActivity} from '../controllers/administration-activity.controller'
import {authenticate} from '../middlewares/authenticate.middleware'
import {authorize} from '../middlewares/authorize.middleware'
import {requireParish} from '../middlewares/parish.middleware'
const router=Router()
router.use(authenticate,authorize('ADMIN_PARISH'),requireParish)
router.get('/',getActivity)
export default router
