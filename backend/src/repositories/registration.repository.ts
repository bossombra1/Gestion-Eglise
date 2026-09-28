import { prisma } from '../lib/prisma'

const registrationInclude = {
  child: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      gender: true,
      parentLinks: {
        select: {
          relationship: true,
          isPrimary: true,
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
    select: {
      id: true,
      name: true,
      code: true,
      parishId: true,
    },
  },
} as const

export const registrationRepository = {
  findManaged(userId: string, parishId: string | undefined, status?: string) {
    return prisma.registration.findMany({
      where: {
        movement: {
          managerId: userId,
          ...(parishId ? { parishId } : {}),
          status: { not: 'ARCHIVED' },
        },
        ...(status ? { status: status as never } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: registrationInclude,
    })
  },

  findManagedById(id: string, userId: string, parishId?: string) {
    return prisma.registration.findFirst({
      where: {
        id,
        movement: {
          managerId: userId,
          ...(parishId ? { parishId } : {}),
          status: { not: 'ARCHIVED' },
        },
      },
      include: registrationInclude,
    })
  },

  updateStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    data: {
      approvedAt?: Date | null
      rejectedAt?: Date | null
      rejectionReason?: string | null
    },
  ) {
    return prisma.registration.update({
      where: { id },
      data: {
        status,
        ...data,
      },
      include: registrationInclude,
    })
  },
}
