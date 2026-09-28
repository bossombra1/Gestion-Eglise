import { Router } from 'express'
import { createFee, createPayment, deleteFee, getFees, getPayments, updateFee } from '../controllers/payment.controller'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'

const router = Router()

router.use(authenticate, authorize('MOVEMENT_MANAGER'), requireParish)

router.get('/fees', getFees)
router.post('/fees', createFee)
router.patch('/fees/:id', updateFee)
router.delete('/fees/:id', deleteFee)
router.get('/', getPayments)
router.post('/', createPayment)

export default router
