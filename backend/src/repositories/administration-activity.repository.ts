import { prisma } from '../lib/prisma'

export const administrationActivityRepository = {
  async getActivity(parishId: string, movementId?: string, days = 30) {
    const safeDays = Math.min(Math.max(days, 7), 90)
    const since = new Date(Date.now() - safeDays * 86400000)

    const [registrations, payments, members] = await Promise.all([
      prisma.registration.findMany({
        where: {
          parishId,
          ...(movementId ? { movementId } : {}),
          registrationDate: { gte: since },
        },
        orderBy: { registrationDate: 'desc' },
        take: 100,
        select: {
          id: true,
          status: true,
          registrationDate: true,
          movement: { select: { id: true, name: true, code: true } },
          child: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.payment.findMany({
        where: {
          parishId,
          createdAt: { gte: since },
          ...(movementId ? { registration: { movementId } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          method: true,
          createdAt: true,
          registration: {
            select: {
              movement: { select: { id: true, name: true, code: true } },
            },
          },
        },
      }),
      prisma.movementMember.count({
        where: {
          movement: {
            parishId,
            ...(movementId ? { id: movementId } : {}),
          },
          status: 'ACTIVE',
        },
      }),
    ])

    const registrationByDay = new Map<string, number>()
    for (const item of registrations) {
      const key = item.registrationDate.toISOString().slice(0, 10)
      registrationByDay.set(key, (registrationByDay.get(key) ?? 0) + 1)
    }

    const successfulPayments = payments.filter((payment) => payment.status === 'SUCCESS')
    const paymentAmount = successfulPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    )

    return {
      periodDays: safeDays,
      activeMembers: members,
      registrationsCount: registrations.length,
      successfulPaymentsCount: successfulPayments.length,
      successfulPaymentsAmount: paymentAmount,
      currency: 'XOF',
      registrationTrend: Array.from(registrationByDay, ([date, count]) => ({ date, count })).sort(
        (a, b) => a.date.localeCompare(b.date),
      ),
      recentRegistrations: registrations,
      recentPayments: payments,
    }
  },
}
