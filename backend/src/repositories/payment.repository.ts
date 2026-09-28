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

const managedMovementWhere = (userId: string, parishId?: string) => ({
  managerId: userId,
  ...(parishId ? { parishId } : {}),
  status: { not: 'ARCHIVED' as const },
})

export const paymentRepository = {
  findManagedFees(userId: string, parishId?: string) {
    return prisma.movementFee.findMany({
      where: { active: true, movement: managedMovementWhere(userId, parishId) },
      orderBy: { createdAt: 'desc' },
      select: feeSelect,
    })
  },

  createFee(userId: string, parishId: string | undefined, data: { movementId: string; name: string; amount: number; dueDate?: Date }) {
    return prisma.movementFee.create({
      data: { movementId: data.movementId, name: data.name, amount: data.amount, dueDate: data.dueDate },
      select: feeSelect,
    })
  },

  findManagedFeeForUpdate(userId: string, parishId: string | undefined, feeId: string) {
    return prisma.movementFee.findFirst({
      where: {
        id: feeId,
        movement: managedMovementWhere(userId, parishId),
      },
      select: { id: true, movementId: true, active: true },
    })
  },

  async countPaymentsForFee(feeId: string) {
    return prisma.payment.count({ where: { feeId } })
  },

  updateFee(feeId: string, data: { name: string; amount: number; dueDate?: Date; active?: boolean }) {
    return prisma.movementFee.update({
      where: { id: feeId },
      data: { name: data.name, amount: data.amount, dueDate: data.dueDate, ...(data.active === undefined ? {} : { active: data.active }) },
      select: feeSelect,
    })
  },

  async deleteFeeWithPayments(feeId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { feeId } })
      return tx.movementFee.delete({ where: { id: feeId }, select: feeSelect })
    })
  },

  findManagedMovement(userId: string, parishId: string | undefined, movementId: string) {
    return prisma.movement.findFirst({
      where: { id: movementId, ...managedMovementWhere(userId, parishId) },
      select: { id: true, parishId: true },
    })
  },

  findManagedRegistration(userId: string, parishId: string | undefined, registrationId: string) {
    return prisma.registration.findFirst({
      where: {
        id: registrationId,
        status: { in: ['APPROVED', 'COMPLETED'] },
        movement: managedMovementWhere(userId, parishId),
      },
      select: { id: true, parishId: true, movementId: true },
    })
  },

  findManagedFee(userId: string, parishId: string | undefined, feeId: string) {
    return prisma.movementFee.findFirst({
      where: {
        id: feeId,
        active: true,
        movement: managedMovementWhere(userId, parishId),
      },
      select: { id: true, movementId: true, amount: true, currency: true },
    })
  },

  getSuccessfulFeeTotal(feeId: string, registrationId: string) {
    return prisma.payment.aggregate({
      where: { feeId, registrationId, status: 'SUCCESS' },
      _sum: { amount: true },
    })
  },

  getSuccessfulFeePaidTotal(feeId: string) {
    return prisma.payment.aggregate({
      where: { feeId, status: 'SUCCESS' },
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
        fee: {
          is: {
            active: true,
            movement: managedMovementWhere(userId, parishId),
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: paymentInclude,
    })
  },
}
