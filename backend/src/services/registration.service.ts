import {
  registrationRepository,
} from '../repositories/registration.repository'

export class RegistrationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message)
    this.name = 'RegistrationError'
  }
}

export const registrationService = {
  async listManaged(userId: string, parishId: string | undefined, status?: string) {
    return registrationRepository.findManaged(userId, parishId, status)
  },

  async approve(id: string, userId: string, parishId?: string) {
    const registration = await registrationRepository.findManagedById(id, userId, parishId)

    if (!registration) {
      throw new RegistrationError('Inscription introuvable.', 404)
    }

    if (registration.status !== 'PENDING') {
      throw new RegistrationError('Seule une inscription en attente peut être approuvée.')
    }

    return registrationRepository.updateStatus(id, 'APPROVED', {
      approvedAt: new Date(),
      rejectedAt: null,
      rejectionReason: null,
    })
  },

  async reject(
    id: string,
    userId: string,
    parishId: string | undefined,
    rejectionReason?: string,
  ) {
    const registration = await registrationRepository.findManagedById(id, userId, parishId)

    if (!registration) {
      throw new RegistrationError('Inscription introuvable.', 404)
    }

    if (registration.status !== 'PENDING') {
      throw new RegistrationError('Seule une inscription en attente peut être refusée.')
    }

    return registrationRepository.updateStatus(id, 'REJECTED', {
      rejectedAt: new Date(),
      approvedAt: null,
      rejectionReason: rejectionReason ?? null,
    })
  },
}
