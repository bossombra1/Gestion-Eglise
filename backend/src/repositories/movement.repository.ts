import { prisma } from '../lib/prisma'

export const movementRepository = {
  findManagedMovements(userId: string, parishId?: string) {
    return prisma.movement.findMany({
      where: {
        managerId: userId,
        ...(parishId ? { parishId } : {}),
        status: { not: 'ARCHIVED' },
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        parishId: true,
        managerId: true,
      },
    })
  },

  async getDashboard(userId: string, parishId?: string) {
    const movements = await this.findManagedMovements(userId, parishId)
    const movementIds = movements.map((movement) => movement.id)

    if (movementIds.length === 0) {
      return {
        movements: [],
        totals: {
          movements: 0,
          children: 0,
          activeMembers: 0,
          pendingRegistrations: 0,
          successfulPayments: 0,
          paymentsAmount: 0,
        },
      }
    }

    const [children, activeMembers, pendingRegistrations, successfulPayments] =
      await Promise.all([
        prisma.registration.count({
          where: { movementId: { in: movementIds } },
        }),
        prisma.movementMember.count({
          where: {
            movementId: { in: movementIds },
            status: 'ACTIVE',
          },
        }),
        prisma.registration.count({
          where: {
            movementId: { in: movementIds },
            status: 'PENDING',
          },
        }),
        prisma.payment.aggregate({
          where: {
            registration: { movementId: { in: movementIds } },
            status: 'SUCCESS',
          },
          _count: { _all: true },
          _sum: { amount: true },
        }),
      ])

    return {
      movements,
      totals: {
        movements: movements.length,
        children,
        activeMembers,
        pendingRegistrations,
        successfulPayments: successfulPayments._count._all,
        paymentsAmount: Number(successfulPayments._sum.amount ?? 0),
      },
    }
  },

  findChildren(userId: string, parishId?: string) {
    return prisma.registration.findMany({
      where: {
        movement: {
          managerId: userId,
          ...(parishId ? { parishId } : {}),
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        child: {
          include: {
            parentLinks: {
              include: {
                parent: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        movement: {
          select: { id: true, name: true, code: true },
        },
      },
    })
  },

  findParents(userId: string, parishId?: string) {
    return prisma.user.findMany({
      where: {
        role: 'PARENT',
        status: 'ACTIVE',
        ...(parishId ? { parishId } : {}),
        parentLinks: {
          some: {
            child: {
              registrations: {
                some: {
                  movement: {
                    managerId: userId,
                    ...(parishId ? { parishId } : {}),
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        parishId: true,
      },
    })
  },
}
