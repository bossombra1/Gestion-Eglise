import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '../types/auth'

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.',
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n’avez pas les droits nécessaires.',
      })
    }

    return next()
  }
}
