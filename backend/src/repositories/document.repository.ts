import { prisma } from '../lib/prisma'

const managedMovementWhere = (userId: string, parishId?: string, movementId?: string) => ({
  ...(movementId ? { id: movementId } : {}),
  ...(parishId ? { parishId } : {}),
  managerId: userId,
  status: { not: 'ARCHIVED' as const },
})

export const documentRepository = {
  findManagedDocuments(userId: string, parishId?: string, movementId?: string) {
    return prisma.document.findMany({
      where: {
        ...(parishId ? { parishId } : {}),
        ...(movementId ? { movementId } : {}),
        movement: { is: managedMovementWhere(userId, parishId, movementId) },
      },
      include: {
        movement: { select: { id: true, name: true, code: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  findManagedMovement(userId: string, movementId: string, parishId?: string) {
    return prisma.movement.findFirst({
      where: managedMovementWhere(userId, parishId, movementId),
      select: { id: true, parishId: true, name: true, code: true },
    })
  },

  findManagedDocument(userId: string, documentId: string, parishId?: string) {
    return prisma.document.findFirst({
      where: {
        id: documentId,
        ...(parishId ? { parishId } : {}),
        movement: { is: managedMovementWhere(userId, parishId) },
      },
      include: {
        movement: { select: { id: true, name: true, code: true } },
      },
    })
  },

  create(data: {
    name: string
    description?: string
    type: 'GENERAL' | 'REGISTRATION' | 'MEDICAL' | 'ADMINISTRATIVE' | 'FINANCIAL' | 'COMMUNICATION' | 'OTHER'
    fileName: string
    filePath: string
    mimeType: string
    size: number
    parishId: string
    movementId: string
    uploadedById: string
  }) {
    return prisma.document.create({
      data,
      include: {
        movement: { select: { id: true, name: true, code: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })
  },

  delete(documentId: string) {
    return prisma.document.delete({ where: { id: documentId } })
  },
}
