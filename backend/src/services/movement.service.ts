import { movementRepository } from '../repositories/movement.repository'

export const movementService = {
  getMyMovements(userId: string, parishId?: string) {
    return movementRepository.findManagedMovements(userId, parishId)
  },

  getDashboard(userId: string, parishId?: string) {
    return movementRepository.getDashboard(userId, parishId)
  },

  getChildren(userId: string, parishId?: string) {
    return movementRepository.findChildren(userId, parishId)
  },

  getParents(userId: string, parishId?: string) {
    return movementRepository.findParents(userId, parishId)
  },
}
