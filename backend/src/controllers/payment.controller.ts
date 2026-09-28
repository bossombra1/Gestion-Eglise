import type { NextFunction, Request, Response } from 'express'
import { feeCreateSchema, paymentCreateSchema } from '../schemas/payment.schema'
import { paymentService } from '../services/payment.service'

const getContext = (req: Request) => {
  if (!req.user) throw new Error('Utilisateur non authentifié.')
  return { userId: req.user.id, parishId: req.user.parishId }
}

export const getFees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const data = await paymentService.listFees(context.userId, context.parishId)
    return res.json({ success: true, data })
  } catch (error) { return next(error) }
}

export const createFee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const input = feeCreateSchema.parse(req.body)
    const data = await paymentService.createFee(context.userId, context.parishId, input)
    return res.status(201).json({ success: true, data })
  } catch (error) { return next(error) }
}

export const updateFee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const input = feeCreateSchema.omit({ movementId: true }).extend({
      active: feeCreateSchema.shape.movementId.optional().transform(() => undefined),
    })
    const body = {
      name: req.body.name,
      amount: req.body.amount,
      dueDate: req.body.dueDate,
      active: req.body.active,
    }
    const parsed = (await import('zod')).z.object({
      name: (await import('zod')).z.string().trim().min(2).max(150),
      amount: (await import('zod')).z.coerce.number().positive().max(100000000),
      dueDate: (await import('zod')).z.string().datetime().optional(),
      active: (await import('zod')).z.boolean().optional(),
    }).parse(body)
    const data = await paymentService.updateFee(context.userId, context.parishId, req.params.id, parsed)
    return res.json({ success: true, data })
  } catch (error) { return next(error) }
}

export const deleteFee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const data = await paymentService.deleteFee(context.userId, context.parishId, req.params.id)
    return res.json({ success: true, data })
  } catch (error) { return next(error) }
}

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const data = await paymentService.listPayments(context.userId, context.parishId)
    return res.json({ success: true, data })
  } catch (error) { return next(error) }
}

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const input = paymentCreateSchema.parse(req.body)
    const data = await paymentService.createPayment(context.userId, context.parishId, input)
    return res.status(201).json({ success: true, data })
  } catch (error) { return next(error) }
}
