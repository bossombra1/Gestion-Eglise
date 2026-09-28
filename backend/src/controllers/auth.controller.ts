import type { NextFunction, Request, Response } from 'express'
import { loginSchema } from '../schemas/auth.schema'
import { authService } from '../services/auth.service'

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = loginSchema.parse(req.body)
    const result = await authService.login(input)

    return res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return next(error)
  }
}

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.',
      })
    }

    const user = await authService.me(req.user.id)

    return res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    return next(error)
  }
}
