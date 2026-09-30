import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middlewares/authenticate.middleware'
import { authorize } from '../middlewares/authorize.middleware'
import { requireParish } from '../middlewares/parish.middleware'

const router = Router()

router.use(authenticate, authorize('ADMIN_PARISH'), requireParish)

router.get('/', async (req, res, next) => {
  try {
    const parishId = req.user!.parishId!
    const q = String(req.query.q ?? '').trim()

    const acts = await prisma.sacramentalAct.findMany({
      where: {
        parishId,
        ...(q
          ? {
              OR: [
                { personFirstName: { contains: q, mode: 'insensitive' } },
                { personLastName: { contains: q, mode: 'insensitive' } },
                { registerNumber: { contains: q, mode: 'insensitive' } },
                { certificateNumber: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ celebrationDate: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    })

    res.json({ success: true, data: { acts } })
  } catch (e) {
    next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const parishId = req.user!.parishId!
    const b = req.body ?? {}

    if (!b.personFirstName?.trim() || !b.personLastName?.trim() || !b.type || !b.celebrationDate) {
      return res.status(400).json({
        success: false,
        message: 'Nom, prénom, sacrement et date sont obligatoires.',
      })
    }

    const item = await prisma.sacramentalAct.create({
      data: {
        parishId,
        personFirstName: String(b.personFirstName).trim(),
        personLastName: String(b.personLastName).trim(),
        personBirthDate: b.personBirthDate ? new Date(b.personBirthDate) : null,
        type: b.type,
        celebrationDate: new Date(b.celebrationDate),
        place: b.place?.trim() || null,
        celebrantName: b.celebrantName?.trim() || null,
        registerNumber: b.registerNumber?.trim() || null,
        certificateNumber: b.certificateNumber?.trim() || null,
        notes: b.notes?.trim() || null,
        annotations: b.annotations?.trim() || null,
      },
    })

    res.status(201).json({ success: true, data: item })
  } catch (e) {
    next(e)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const parishId = req.user!.parishId!
    const b = req.body ?? {}

    const item = await prisma.sacramentalAct.updateMany({
      where: { id: req.params.id, parishId },
      data: {
        ...(b.personFirstName !== undefined ? { personFirstName: String(b.personFirstName).trim() } : {}),
        ...(b.personLastName !== undefined ? { personLastName: String(b.personLastName).trim() } : {}),
        ...(b.personBirthDate !== undefined ? { personBirthDate: b.personBirthDate ? new Date(b.personBirthDate) : null } : {}),
        ...(b.status ? { status: b.status } : {}),
        ...(b.celebrationDate ? { celebrationDate: new Date(b.celebrationDate) } : {}),
        ...(b.place !== undefined ? { place: b.place?.trim() || null } : {}),
        ...(b.celebrantName !== undefined ? { celebrantName: b.celebrantName?.trim() || null } : {}),
        ...(b.registerNumber !== undefined ? { registerNumber: b.registerNumber?.trim() || null } : {}),
        ...(b.certificateNumber !== undefined ? { certificateNumber: b.certificateNumber?.trim() || null } : {}),
        ...(b.notes !== undefined ? { notes: b.notes?.trim() || null } : {}),
        ...(b.annotations !== undefined ? { annotations: b.annotations?.trim() || null } : {}),
      },
    })

    if (!item.count) return res.status(404).json({ success: false, message: 'Acte introuvable.' })
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

export default router
