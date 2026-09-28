import { describe, expect, it, beforeEach } from 'vitest'
import { signAccessToken } from '../src/services/token.service'
import { verifyAccessToken } from '../src/services/token.service'

describe('JWT authentication', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-with-more-than-16-chars'
  })

  it('signe et vérifie un utilisateur', () => {
    const user = {
      id: 'user-1',
      role: 'MOVEMENT_MANAGER' as const,
      parishId: 'parish-1',
    }

    const token = signAccessToken(user)
    const payload = verifyAccessToken(token)

    expect(payload.id).toBe(user.id)
    expect(payload.role).toBe(user.role)
    expect(payload.parishId).toBe(user.parishId)
  })
})
