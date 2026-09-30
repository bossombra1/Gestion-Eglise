import type { NextFunction, Request, Response } from 'express'
import { administrationUserService } from '../services/administration-user.service'

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.parishId) return res.status(403).json({ success:false, message:'Aucune paroisse n’est associée à ce compte.' })
    const data = await administrationUserService.listUsers(
      req.user.parishId,
      typeof req.query.search === 'string' ? req.query.search : undefined,
      typeof req.query.role === 'string' ? req.query.role : undefined,
      typeof req.query.status === 'string' ? req.query.status : undefined,
    )
    return res.json({ success:true, data })
  } catch (error) { return next(error) }
}
