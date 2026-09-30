import { prisma } from '../lib/prisma'

export const administrationDocumentRepository = {
  findDocuments(parishId: string, params: { search?: string; type?: string; movementId?: string }) {
    const search = params.search?.trim()
    return prisma.document.findMany({
      where: {
        parishId,
        ...(params.type ? { type: params.type as any } : {}),
        ...(params.movementId ? { movementId: params.movementId } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { fileName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        fileName: true,
        mimeType: true,
        size: true,
        createdAt: true,
        updatedAt: true,
        movement: { select: { id: true, name: true, code: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  findDocument(parishId: string, documentId: string) {
    return prisma.document.findFirst({
      where: { id: documentId, parishId },
      select: {
        id: true,
        fileName: true,
        filePath: true,
        mimeType: true,
      },
    })
  },
}
