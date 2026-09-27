import type { NextFunction, Request, Response } from 'express'
import { registrationDecisionSchema, registrationListSchema } from '../schemas/registration.schema'
import { registrationService } from '../services/registration.service'

const getContext = (req: Request) => {
  if (!req.user) {
    throw new Error('Utilisateur non authentifié.')
  }

  return {
    userId: req.user.id,
    parishId: req.user.parishId,
  }
}

export const getRegistrations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const input = registrationListSchema.parse(req.query)
    const data = await registrationService.listManaged(context.userId, context.parishId, input.status)

    return res.json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}

export const approveRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const data = await registrationService.approve(req.params.id, context.userId, context.parishId)

    return res.json({
      success: true,
      message: 'Inscription approuvée.',
      data,
    })
  } catch (error) {
    return next(error)
  }
}

export const rejectRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const input = registrationDecisionSchema.parse(req.body)
    const data = await registrationService.reject(
      req.params.id,
      context.userId,
      context.parishId,
      input.rejectionReason,
    )

    return res.json({
      success: true,
      message: 'Inscription refusée.',
      data,
    })
  } catch (error) {
    return next(error)
  }
}
