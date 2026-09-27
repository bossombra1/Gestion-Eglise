import type { NextFunction, Request, Response } from 'express'

export const requireParish = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise.',
    })
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next()
  }

  if (!req.user.parishId) {
    return res.status(403).json({
      success: false,
      message: 'Aucune paroisse n’est associée à ce compte.',
    })
  }

  return next()
}
