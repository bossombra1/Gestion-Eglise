import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { AuthenticatedUser } from '../types/auth'

const JWT_EXPIRES_IN = '8h'

export const signAccessToken = (user: AuthenticatedUser): string => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET n’est pas configuré.')
  }

  return jwt.sign(user, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyAccessToken = (token: string): AuthenticatedUser => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET n’est pas configuré.')
  }

  const payload = jwt.verify(token, env.JWT_SECRET)

  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof payload.id !== 'string' ||
    typeof payload.role !== 'string'
  ) {
    throw new Error('Token invalide.')
  }

  return {
    id: payload.id,
    role: payload.role as AuthenticatedUser['role'],
    parishId: typeof payload.parishId === 'string' ? payload.parishId : undefined,
    movementId: typeof payload.movementId === 'string' ? payload.movementId : undefined,
  }
}
