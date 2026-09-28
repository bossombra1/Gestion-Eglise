import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../services/token.service'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.header('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise.',
    })
  }

  try {
    req.user = verifyAccessToken(authorization.slice(7))
    return next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Session invalide ou expirée.',
    })
  }
}
