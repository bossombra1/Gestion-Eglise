import { prisma } from '../lib/prisma'

export const administrationRepository = {
  async getDashboard(parishId: string) {
    const [
      parish,
      totalUsers,
      activeUsers,
      totalMovements,
      activeMovements,
      totalRegistrations,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      successfulPayments,
      pendingPayments,
      successfulPaymentAggregate,
      movementActivity,
    ] = await Promise.all([
      prisma.parish.findUnique({
        where: { id: parishId },
        select: { id: true, name: true, code: true },
      }),
      prisma.user.count({ where: { parishId } }),
      prisma.user.count({ where: { parishId, status: 'ACTIVE' } }),
      prisma.movement.count({ where: { parishId } }),
      prisma.movement.count({ where: { parishId, status: 'ACTIVE' } }),
      prisma.registration.count({ where: { parishId } }),
      prisma.registration.count({ where: { parishId, status: 'PENDING' } }),
      prisma.registration.count({ where: { parishId, status: 'APPROVED' } }),
      prisma.registration.count({ where: { parishId, status: 'REJECTED' } }),
      prisma.payment.count({ where: { parishId, status: 'SUCCESS' } }),
      prisma.payment.count({ where: { parishId, status: 'PENDING' } }),
      prisma.payment.aggregate({
        where: { parishId, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.movement.findMany({
        where: { parishId },
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          _count: {
            select: {
              members: true,
              registrations: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ])

    if (!parish) throw new Error('Paroisse introuvable.')

    return {
      parish,
      users: { total: totalUsers, active: activeUsers },
      movements: { total: totalMovements, active: activeMovements },
      registrations: {
        total: totalRegistrations,
        pending: pendingRegistrations,
        approved: approvedRegistrations,
        rejected: rejectedRegistrations,
      },
      payments: {
        successful: successfulPayments,
        pending: pendingPayments,
        totalAmount: Number(successfulPaymentAggregate._sum.amount ?? 0),
        currency: 'XOF',
      },
      movementActivity,
    }
  },
}
