import { Router } from 'express'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'EcclesiaConnect API is running',
  })
})

export default router
