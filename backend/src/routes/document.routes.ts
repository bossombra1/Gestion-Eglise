import { Router } from 'express'
import express from 'express'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'
import { deleteDocument, downloadDocument, getDocuments, uploadDocument } from '../controllers/document.controller'

const router = Router()

router.use(authenticate, authorize('MOVEMENT_MANAGER'), requireParish)
router.get('/', getDocuments)
router.post('/', express.raw({ type: '*/*', limit: '10mb' }), uploadDocument)
router.get('/:id/download', downloadDocument)
router.delete('/:id', deleteDocument)

export default router
