import { prisma } from '../lib/prisma'

const managedMovementWhere = (userId: string, parishId?: string) => ({
  managerId: userId,
  ...(parishId ? { parishId } : {}),
  status: { not: 'ARCHIVED' as const },
})

export const movementRepository = {
  findManagedMovements(userId: string, parishId?: string) {
    return prisma.movement.findMany({
      where: managedMovementWhere(userId, parishId),
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        parishId: true,
        managerId: true,
        parish: { select: { id: true, name: true, code: true } },
      },
    })
  },

  findManagedMovement(userId: string, parishId: string | undefined, movementId: string) {
    return prisma.movement.findFirst({
      where: {
        id: movementId,
        ...managedMovementWhere(userId, parishId),
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        parishId: true,
        managerId: true,
        parish: { select: { id: true, name: true, code: true } },
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

    const [children, activeMembers, pendingRegistrations, successfulPayments] = await Promise.all([
      prisma.registration.count({
        where: {
          movementId: { in: movementIds },
          status: { in: ['APPROVED', 'COMPLETED'] },
        },
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
          status: 'SUCCESS',
          fee: {
            is: {
              active: true,
              movementId: { in: movementIds },
            },
          },
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

  findChildren(userId: string, parishId?: string, movementId?: string) {
    return prisma.registration.findMany({
      where: {
        ...(movementId ? { movementId } : {}),
        movement: {
          ...managedMovementWhere(userId, parishId),
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
        movement: { select: { id: true, name: true, code: true } },
      },
    })
  },

  findManagedChild(userId: string, parishId: string | undefined, childId: string) {
    return prisma.child.findFirst({
      where: {
        id: childId,
        parentLinks: {
          some: {
            child: {
              registrations: {
                some: {
                  movement: {
                    ...managedMovementWhere(userId, parishId),
                  },
                },
              },
            },
          },
        },
      },
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
        registrations: {
          where: {
            movement: {
              ...managedMovementWhere(userId, parishId),
            },
          },
          include: {
            movement: { select: { id: true, name: true, code: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  },
}
