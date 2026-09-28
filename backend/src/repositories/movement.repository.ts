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
        parish: { select: { id: true, name: true, code: true } },
      },
    })
  },

  async findManagedMovement(userId: string, movementId: string, parishId?: string) {
    return prisma.movement.findFirst({
      where: {
        id: movementId,
        managerId: userId,
        ...(parishId ? { parishId } : {}),
        status: { not: 'ARCHIVED' },
      },
      select: { id: true, name: true, code: true, parishId: true },
    })
  },

  async getDashboard(userId: string, parishId?: string) {
    const movements = await this.findManagedMovements(userId, parishId)
    const movementIds = movements.map((movement) => movement.id)

    if (movementIds.length === 0) {
      return {
        movements: [],
        totals: { movements: 0, children: 0, activeMembers: 0, pendingRegistrations: 0, successfulPayments: 0, paymentsAmount: 0 },
      }
    }

    const [children, activeMembers, pendingRegistrations, successfulPayments] = await Promise.all([
      prisma.registration.count({\n        where: {\n          movementId: { in: movementIds },\n          status: { in: ['APPROVED', 'COMPLETED'] },\n        },\n      }),
      prisma.movementMember.count({ where: { movementId: { in: movementIds }, status: 'ACTIVE' } }),
      prisma.registration.count({ where: { movementId: { in: movementIds }, status: 'PENDING' } }),
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
          managerId: userId,
          ...(parishId ? { parishId } : {}),
          status: { not: 'ARCHIVED' },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        child: {
          include: {
            parentLinks: {
              include: {
                parent: {
                  select: { id: true, firstName: true, lastName: true, email: true, phone: true },
                },
              },
            },
          },
        },
        movement: { select: { id: true, name: true, code: true } },
      },
    })
  },

  async findManagedChild(userId: string, childId: string, parishId?: string) {
    const registration = await prisma.registration.findFirst({
      where: {
        childId,
        movement: {
          managerId: userId,
          ...(parishId ? { parishId } : {}),
          status: { not: 'ARCHIVED' },
        },
      },
      select: { childId: true },
    })

    if (!registration) return null

    return prisma.child.findUnique({
      where: { id: childId },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
        parentLinks: {
          orderBy: { isPrimary: 'desc' },
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                status: true,
              },
            },
          },
        },
        registrations: {
          where: {
            movement: {
              managerId: userId,
              ...(parishId ? { parishId } : {}),
              status: { not: 'ARCHIVED' },
            },
          },
          orderBy: { registrationDate: 'desc' },
          select: {
            id: true,
            movementId: true,
            status: true,
            registrationDate: true,
            approvedAt: true,
            rejectedAt: true,
            rejectionReason: true,
            notes: true,
            movement: { select: { id: true, name: true, code: true } },
          },
        },
      },
    })
  },

  findParents(userId: string, parishId?: string, movementId?: string) {
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
                  ...(movementId ? { movementId } : {}),
                  movement: {
                    managerId: userId,
                    ...(parishId ? { parishId } : {}),
                    status: { not: 'ARCHIVED' },
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
        parentLinks: {
          where: {
            child: {
              registrations: {
                some: {
                  ...(movementId ? { movementId } : {}),
                  movement: {
                    managerId: userId,
                    ...(parishId ? { parishId } : {}),
                    status: { not: 'ARCHIVED' },
                  },
                },
              },
            },
          },
          orderBy: { isPrimary: 'desc' },
          select: {
            relationship: true,
            isPrimary: true,
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                registrations: {
                  where: {
                    ...(movementId ? { movementId } : {}),
                    movement: {
                      managerId: userId,
                      ...(parishId ? { parishId } : {}),
                      status: { not: 'ARCHIVED' },
                    },
                  },
                  select: {
                    movement: { select: { id: true, name: true, code: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
  },
}
