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

  async getChild(userId: string, childId: string, parishId?: string) {
    const child = await movementRepository.findManagedChild(userId, childId, parishId)

    if (!child) {
      throw new Error('Fiche enfant introuvable ou non autorisée.')
    }

    return child
  },

  async getParents(userId: string, parishId?: string, movementId?: string) {
    if (movementId) {
      const movement = await movementRepository.findManagedMovement(userId, movementId, parishId)
      if (!movement) throw new Error('Mouvement non autorisé ou introuvable.')
    }

    const parents = await movementRepository.findParents(userId, parishId, movementId)

    return parents.map((parent) => ({
      id: parent.id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      phone: parent.phone,
      parishId: parent.parishId,
      children: parent.parentLinks.map((link) => ({
        id: link.child.id,
        firstName: link.child.firstName,
        lastName: link.child.lastName,
        relationship: link.relationship,
        isPrimary: link.isPrimary,
        movements: Array.from(
          new Map(
            link.child.registrations.map((registration) => [
              registration.movement.id,
              registration.movement,
            ]),
          ).values(),
        ),
      })),
    }))
  },
}
