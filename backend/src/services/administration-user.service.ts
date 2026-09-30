import { administrationUserRepository } from '../repositories/administration-user.repository'

export const administrationUserService = {
  listUsers(parishId: string, search?: string, role?: string, status?: string) {
    return administrationUserRepository.findUsers(parishId, search, role, status)
  },
}
