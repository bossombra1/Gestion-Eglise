import api from './api'

export type AdministrationDocumentType = 'GENERAL' | 'REGISTRATION' | 'MEDICAL' | 'ADMINISTRATIVE' | 'FINANCIAL' | 'COMMUNICATION' | 'OTHER'

export interface AdministrationDocument {
  id: string
  name: string
  description: string | null
  type: AdministrationDocumentType
  fileName: string
  mimeType: string | null
  size: number | null
  createdAt: string
  updatedAt: string
  movement: { id: string; name: string; code: string } | null
  uploadedBy: { id: string; firstName: string; lastName: string }
}

export const administrationDocumentsApi = {
  async list(params?: { search?: string; type?: string; movementId?: string }) {
    const response = await api.get<{ success: boolean; data: AdministrationDocument[] }>('/administration/documents', { params })
    return response.data.data
  },
  async download(id: string) {
    const response = await api.get<Blob>(`/administration/documents/${id}/download`, { responseType: 'blob' })
    return response.data
  },
}
