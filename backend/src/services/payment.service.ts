import { paymentRepository } from '../repositories/payment.repository'
import type { FeeCreateInput, PaymentCreateInput } from '../schemas/payment.schema'

export class PaymentError extends Error {
  constructor(message: string, public readonly statusCode = 400) {
    super(message)
    this.name = 'PaymentError'
  }
}

export const paymentService = {
  listFees(userId: string, parishId?: string) {
    return paymentRepository.findManagedFees(userId, parishId)
  },

  async createFee(userId: string, parishId: string | undefined, input: FeeCreateInput) {
    const movement = await paymentRepository.findManagedMovement(userId, parishId, input.movementId)
    if (!movement) throw new PaymentError('Mouvement introuvable ou non autorisé.', 404)

    return paymentRepository.createFee(userId, parishId, {
      movementId: input.movementId,
      name: input.name,
      amount: input.amount,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    })
  },

  listPayments(userId: string, parishId?: string) {
    return paymentRepository.findManagedPayments(userId, parishId)
  },

  async createPayment(userId: string, parishId: string | undefined, input: PaymentCreateInput) {
    const registration = await paymentRepository.findManagedRegistration(userId, parishId, input.registrationId)
    if (!registration) throw new PaymentError('Inscription introuvable, non approuvée ou non autorisée.', 404)

    if (input.feeId) {
      const fee = await paymentRepository.findManagedFee(userId, parishId, input.feeId)
      if (!fee || fee.movementId !== registration.movementId) {
        throw new PaymentError('Cette cotisation n’appartient pas au mouvement de l’inscription ou elle est inactive.', 400)
      }

      if (input.amount > Number(fee.amount)) {
        throw new PaymentError('Le montant du paiement dépasse le montant de la cotisation.', 400)
      }

      const total = await paymentRepository.getSuccessfulFeeTotal(input.feeId, input.registrationId)
      const alreadyPaid = Number(total._sum.amount ?? 0)

      if (alreadyPaid + input.amount > Number(fee.amount)) {
        throw new PaymentError('Le paiement dépasserait le montant restant de la cotisation.', 400)
      }
    }

    return paymentRepository.createPayment({
      registrationId: input.registrationId,
      feeId: input.feeId,
      parishId: parishId ?? registration.parishId,
      amount: input.amount,
      method: input.method,
      transactionReference: input.transactionReference,
      createdById: userId,
    })
  },
}
