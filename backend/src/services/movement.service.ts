import { movementRepository } from '../repositories/movement.repository'

export const movementService = {
  getMyMovements(userId: string, parishId?: string) {
    return movementRepository.findManagedMovements(userId, parishId)
  },

  getDashboard(userId: string, parishId?: string) {
    return movementRepository.getDashboard(userId, parishId)
  },

  async getChildren(userId: string, parishId?: string, movementId?: string) {
    if (movementId) {
      const movement = await movementRepository.findManagedMovement(userId, movementId, parishId)
      if (!movement) throw new Error('Mouvement non autorisé ou introuvable.')
    }
    return movementRepository.findChildren(userId, parishId, movementId)
  },

  async getParents(userId: string, parishId?: string, movementId?: string) {
    if (movementId) {
      const movement = await movementRepository.findManagedMovement(userId, movementId, parishId)
      if (!movement) throw new Error('Mouvement non autorisé ou introuvable.')
    }
    return movementRepository.findParents(userId, parishId, movementId)
  },
}
