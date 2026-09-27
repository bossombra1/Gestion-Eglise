import type { NextFunction, Request, Response } from 'express'
import { movementService } from '../services/movement.service'

const getContext = (req: Request) => {
  if (!req.user) {
    throw new Error('Utilisateur non authentifié.')
  }

  return {
    userId: req.user.id,
    parishId: req.user.parishId,
  }
}

export const getMyMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const data = await movementService.getMyMovements(context.userId, context.parishId)
    return res.json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const data = await movementService.getDashboard(context.userId, context.parishId)
    return res.json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}

export const getChildren = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const data = await movementService.getChildren(context.userId, context.parishId)
    return res.json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}

export const getParents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const context = getContext(req)
    const data = await movementService.getParents(context.userId, context.parishId)
    return res.json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}
