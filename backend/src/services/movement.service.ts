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

    const registrations = await movementRepository.findChildren(userId, parishId, movementId)

    return registrations.map((registration) => ({
      id: registration.child.id,
      firstName: registration.child.firstName,
      lastName: registration.child.lastName,
      birthDate: registration.child.birthDate,
      gender: registration.child.gender,
      registrationStatus: registration.status,
      movement: registration.movement,
      parentLinks: registration.child.parentLinks.map((link) => ({
        relationship: link.relationship,
        isPrimary: link.isPrimary,
        parent: link.parent,
      })),
    }))
  },

  async getParents(userId: string, parishId?: string, movementId?: string) {
    if (movementId) {
      const movement = await movementRepository.findManagedMovement(userId, movementId, parishId)
      if (!movement) throw new Error('Mouvement non autorisé ou introuvable.')
    }
    return movementRepository.findParents(userId, parishId, movementId)
  },
}
