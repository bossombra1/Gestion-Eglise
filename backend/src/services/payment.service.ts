import { paymentRepository } from '../repositories/payment.repository'
import type { FeeCreateInput, FeeUpdateInput, PaymentCreateInput } from '../schemas/payment.schema'

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

  async updateFee(userId: string, parishId: string | undefined, feeId: string, input: FeeUpdateInput) {
    const fee = await paymentRepository.findManagedFeeForUpdate(userId, parishId, feeId)
    if (!fee) throw new PaymentError('Cotisation introuvable ou non autorisée.', 404)

    if (input.amount !== undefined && fee.active) {
      const paymentCount = await paymentRepository.countPaymentsForFee(feeId)
      if (paymentCount > 0) {
        const total = await paymentRepository.getSuccessfulFeeTotal(feeId, '')
        const paid = Number(total._sum.amount ?? 0)
        if (input.amount < paid) {
          throw new PaymentError('Le nouveau montant ne peut pas être inférieur aux paiements déjà enregistrés.', 400)
        }
      }
    }

    return paymentRepository.updateFee(feeId, {
      name: input.name,
      amount: input.amount,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      active: input.active,
    })
  },

  async deleteFee(userId: string, parishId: string | undefined, feeId: string) {
    const fee = await paymentRepository.findManagedFeeForUpdate(userId, parishId, feeId)
    if (!fee) throw new PaymentError('Cotisation introuvable ou non autorisée.', 404)

    const paymentCount = await paymentRepository.countPaymentsForFee(feeId)
    if (paymentCount > 0) {
      return {
        deleted: false,
        fee: await paymentRepository.deactivateFee(feeId),
        message: 'La cotisation possède des paiements et a été désactivée pour conserver l’historique financier.',
      }
    }

    return {
      deleted: true,
      fee: await paymentRepository.deleteFee(feeId),
      message: 'Cotisation supprimée.',
    }
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
