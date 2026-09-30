import { administrationDocumentRepository } from '../repositories/administration-document.repository'

export const administrationDocumentService = {
  list(parishId: string, params: { search?: string; type?: string; movementId?: string }) {
    return administrationDocumentRepository.findDocuments(parishId, params)
  },

  async getFile(parishId: string, documentId: string) {
    const document = await administrationDocumentRepository.findDocument(parishId, documentId)
    if (!document) {
      const error = new Error('Document introuvable dans cette paroisse.')
      ;(error as Error & { statusCode?: number }).statusCode = 404
      throw error
    }
    return document
  },
}
