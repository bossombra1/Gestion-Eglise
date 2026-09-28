import type { NextFunction, Request, Response } from 'express'
import { communicationCreateSchema } from '../schemas/communication.schema'
import { communicationService } from '../services/communication.service'

const getContext = (req: Request) => {
  if (!req.user) throw new Error('Utilisateur non authentifié.')
  return { userId: req.user.id, parishId: req.user.parishId }
}

export const getCommunications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const data = await communicationService.list(context.userId, context.parishId)
    return res.json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}

export const createCommunication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const input = communicationCreateSchema.parse(req.body)
    const data = await communicationService.create(context.userId, context.parishId, input)
    return res.status(201).json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}
