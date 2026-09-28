import { communicationRepository } from '../repositories/communication.repository'
import type { CommunicationCreateInput } from '../schemas/communication.schema'

export class CommunicationError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message)
    this.name = 'CommunicationError'
  }
}

export const communicationService = {
  list(userId: string, parishId?: string) {
    return communicationRepository.findManagedCommunications(userId, parishId)
  },

  async create(userId: string, parishId: string | undefined, input: CommunicationCreateInput) {
    if (!parishId) throw new CommunicationError('Aucune paroisse associée à cet utilisateur.', 403)

    const movement = await communicationRepository.findManagedMovement(userId, input.movementId, parishId)
    if (!movement) throw new CommunicationError('Mouvement non autorisé ou introuvable.', 403)

    const [parents, members] = await Promise.all([
      input.audience === 'MEMBERS' ? Promise.resolve([]) : communicationRepository.findParentRecipientIds(movement.id),
      input.audience === 'PARENTS' ? Promise.resolve([]) : communicationRepository.findMemberRecipientIds(movement.id),
    ])

    const recipientIds = new Set<string>()
    for (const recipient of [...parents, ...members]) recipientIds.add(recipient.id)

    if (recipientIds.size === 0) {
      throw new CommunicationError('Aucun destinataire actif ne correspond à cette audience.')
    }

    return communicationRepository.createWithRecipients({
      title: input.title,
      content: input.content,
      type: input.type,
      parishId: movement.parishId,
      movementId: movement.id,
      senderId: userId,
      recipientIds: [...recipientIds],
    })
  },
}
