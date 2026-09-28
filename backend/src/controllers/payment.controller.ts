import type { NextFunction, Request, Response } from 'express'
import { feeCreateSchema, feeUpdateSchema, paymentCreateSchema } from '../schemas/payment.schema'
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
    const input = feeUpdateSchema.parse(req.body)
    const data = await paymentService.updateFee(context.userId, context.parishId, req.params.id, input)
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
