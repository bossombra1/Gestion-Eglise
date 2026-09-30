import { Router } from 'express'
import { getDocuments, downloadDocument } from '../controllers/administration-document.controller'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'

const router = Router()
router.use(authenticate, authorize('ADMIN_PARISH'), requireParish)
router.get('/', getDocuments)
router.get('/:id/download', downloadDocument)
export default router
