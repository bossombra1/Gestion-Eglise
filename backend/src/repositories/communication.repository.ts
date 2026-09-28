import { prisma } from '../lib/prisma'

const managedMovementWhere = (userId: string, parishId?: string, movementId?: string) => ({
  id: movementId,
  managerId: userId,
  ...(parishId ? { parishId } : {}),
  status: { not: 'ARCHIVED' as const },
})

export const communicationRepository = {
  findManagedMovement(userId: string, movementId: string, parishId?: string) {
    return prisma.movement.findFirst({
      where: managedMovementWhere(userId, parishId, movementId),
      select: { id: true, parishId: true, name: true, code: true },
    })
  },

  findManagedCommunications(userId: string, parishId?: string) {
    return prisma.communication.findMany({
      where: {
        ...(parishId ? { parishId } : {}),
        movement: {
          is: {
            managerId: userId,
            ...(parishId ? { parishId } : {}),
            status: { not: 'ARCHIVED' as const },
          },
        },
      },
      include: {
        movement: { select: { id: true, name: true, code: true } },
        sender: { select: { id: true, firstName: true, lastName: true } },
        recipients: { select: { userId: true, readAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  findParentRecipientIds(movementId: string) {
    return prisma.user.findMany({
      where: {
        role: 'PARENT',
        status: 'ACTIVE',
        parentLinks: {
          some: {
            child: {
              registrations: {
                some: {
                  movementId,
                  status: { in: ['APPROVED', 'COMPLETED'] },
                },
              },
            },
          },
        },
      },
      select: { id: true },
    })
  },

  findMemberRecipientIds(movementId: string) {
    return prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        movementMemberships: {
          some: {
            movementId,
            status: 'ACTIVE',
          },
        },
      },
      select: { id: true },
    })
  },

  async createWithRecipients(data: {
    title: string
    content: string
    type: 'ANNOUNCEMENT' | 'MESSAGE' | 'INFORMATION' | 'REMINDER'
    parishId: string
    movementId: string
    senderId: string
    recipientIds: string[]
  }) {
    return prisma.$transaction(async (tx) => {
      const communication = await tx.communication.create({
        data: {
          title: data.title,
          content: data.content,
          type: data.type,
          status: 'SENT',
          parishId: data.parishId,
          movementId: data.movementId,
          senderId: data.senderId,
          sentAt: new Date(),
          recipients: {
            create: data.recipientIds.map((userId) => ({ userId })),
          },
        },
        include: {
          movement: { select: { id: true, name: true, code: true } },
          sender: { select: { id: true, firstName: true, lastName: true } },
          recipients: { select: { userId: true } },
        },
      })

      if (data.recipientIds.length > 0) {
        await tx.notification.createMany({
          data: data.recipientIds.map((userId) => ({
            userId,
            parishId: data.parishId,
            type: data.type === 'REMINDER' ? 'REMINDER' : 'INFORMATION',
            title: data.title,
            message: data.content,
          })),
        })
      }

      return communication
    })
  },
}
