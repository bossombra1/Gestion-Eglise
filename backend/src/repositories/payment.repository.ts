import { prisma } from '../lib/prisma'

const feeSelect = {
  id: true,
  movementId: true,
  name: true,
  amount: true,
  currency: true,
  dueDate: true,
  active: true,
  movement: { select: { id: true, name: true, code: true } },
} as const

const paymentInclude = {
  registration: {
    select: {
      id: true,
      status: true,
      child: { select: { id: true, firstName: true, lastName: true } },
      movement: { select: { id: true, name: true, code: true, managerId: true, parishId: true } },
    },
  },
  fee: { select: { id: true, name: true, amount: true } },
} as const

export const paymentRepository = {
  findManagedFees(userId: string, parishId?: string) {
    return prisma.movementFee.findMany({
      where: { movement: { managerId: userId, ...(parishId ? { parishId } : {}) } },
      orderBy: { createdAt: 'desc' },
      select: feeSelect,
    })
  },

  createFee(userId: string, parishId: string | undefined, data: { movementId: string; name: string; amount: number; dueDate?: Date }) {
    return prisma.movementFee.create({
      data: {
        movementId: data.movementId,
        name: data.name,
        amount: data.amount,
        dueDate: data.dueDate,
      },
      select: feeSelect,
    })
  },

  findManagedMovement(userId: string, parishId: string | undefined, movementId: string) {
    return prisma.movement.findFirst({
      where: { id: movementId, managerId: userId, ...(parishId ? { parishId } : {}) },
      select: { id: true, parishId: true },
    })
  },

  findManagedRegistration(userId: string, parishId: string | undefined, registrationId: string) {
    return prisma.registration.findFirst({
      where: {
        id: registrationId,
        status: { in: ['APPROVED', 'COMPLETED'] },
        movement: { managerId: userId, ...(parishId ? { parishId } : {}) },
      },
      select: { id: true, parishId: true, movementId: true },
    })
  },

  findManagedFee(userId: string, parishId: string | undefined, feeId: string) {
    return prisma.movementFee.findFirst({
      where: {
        id: feeId,
        active: true,
        movement: { managerId: userId, ...(parishId ? { parishId } : {}) },
      },
      select: { id: true, movementId: true, amount: true, currency: true },
    })
  },

  getSuccessfulFeeTotal(feeId: string, registrationId: string) {
    return prisma.payment.aggregate({
      where: {
        feeId,
        registrationId,
        status: 'SUCCESS',
      },
      _sum: { amount: true },
    })
  },

  createPayment(data: {
    registrationId: string
    feeId?: string
    parishId: string
    amount: number
    method: 'WAVE' | 'ORANGE_MONEY' | 'MTN_MONEY' | 'MOOV_MONEY' | 'CASH' | 'OTHER'
    transactionReference?: string
    createdById: string
  }) {
    return prisma.payment.create({
      data: {
        registrationId: data.registrationId,
        feeId: data.feeId,
        parishId: data.parishId,
        amount: data.amount,
        method: data.method,
        transactionReference: data.transactionReference,
        status: 'SUCCESS',
        paidAt: new Date(),
        createdById: data.createdById,
      },
      include: paymentInclude,
    })
  },

  findManagedPayments(userId: string, parishId?: string) {
    return prisma.payment.findMany({
      where: {
        registration: {
          movement: { managerId: userId, ...(parishId ? { parishId } : {}) },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: paymentInclude,
    })
  },
}
