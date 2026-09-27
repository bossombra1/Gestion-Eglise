import bcrypt from 'bcrypt'
import { userRepository } from '../repositories/user.repository'
import { signAccessToken } from './token.service'
import type { LoginInput } from '../schemas/auth.schema'
import type { AuthenticatedUser } from '../types/auth'

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 401,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export const authService = {
  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email.toLowerCase())

    if (!user || user.status !== 'ACTIVE') {
      throw new AuthError('Identifiants invalides.')
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)

    if (!passwordMatches) {
      throw new AuthError('Identifiants invalides.')
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      role: user.role,
      parishId: user.parishId ?? undefined,
    }

    return {
      accessToken: signAccessToken(authenticatedUser),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        parishId: user.parishId,
      },
    }
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId)

    if (!user || user.status !== 'ACTIVE') {
      throw new AuthError('Utilisateur introuvable ou inactif.', 401)
    }

    return user
  },
}
