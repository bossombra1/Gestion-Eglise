import type { NextFunction, Request, Response } from 'express'
import { administrationService } from '../services/administration.service'

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.parishId) {
      return res.status(403).json({
        success: false,
        message: 'Aucune paroisse n’est associée à ce compte.',
      })
    }

    const data = await administrationService.getDashboard(req.user.parishId)
    return res.json({ success: true, data })
  } catch (error) {
    return next(error)
  }
}
