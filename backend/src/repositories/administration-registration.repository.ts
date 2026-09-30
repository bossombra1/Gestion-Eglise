import { prisma } from '../lib/prisma'

export const administrationRegistrationRepository = {
  async list(parishId: string, movementId?: string, status?: string, days = 30) {
    const safeDays = Math.min(Math.max(days, 7), 90)
    const since = new Date(Date.now() - safeDays * 86400000)
    const baseWhere = {
      parishId,
      ...(movementId ? { movementId } : {}),
      registrationDate: { gte: since },
    }
    const where = {
      ...baseWhere,
      ...(status ? { status: status as never } : {}),
    }

    const [items, total, pending, approved, rejected, cancelled, completed] =
      await Promise.all([
        prisma.registration.findMany({
          where,
          orderBy: { registrationDate: 'desc' },
          take: 200,
          select: {
            id: true,
            status: true,
            registrationDate: true,
            approvedAt: true,
            rejectedAt: true,
            rejectionReason: true,
            notes: true,
            movement: {
              select: { id: true, name: true, code: true },
            },
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                birthDate: true,
                parentLinks: {
                  where: { isPrimary: true },
                  take: 1,
                  select: {
                    parent: {
                      select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.registration.count({ where: baseWhere }),
        prisma.registration.count({ where: { ...baseWhere, status: 'PENDING' } }),
        prisma.registration.count({ where: { ...baseWhere, status: 'APPROVED' } }),
        prisma.registration.count({ where: { ...baseWhere, status: 'REJECTED' } }),
        prisma.registration.count({ where: { ...baseWhere, status: 'CANCELLED' } }),
        prisma.registration.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
      ])

    return {
      periodDays: safeDays,
      total,
      pending,
      approved,
      rejected,
      cancelled,
      completed,
      items,
    }
  },
}
