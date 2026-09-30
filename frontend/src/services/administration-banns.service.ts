import api from './api'

export type MarriageDocumentStatus = 'PENDING' | 'COMPLETE' | 'ISSUE'

export interface MarriageCase {
  id: string
  groomName: string
  brideName: string
  groomBirthDate: string | null
  brideBirthDate: string | null
  groomPhone: string | null
  bridePhone: string | null
  groomAddress: string | null
  brideAddress: string | null
  celebrationDate: string
  celebrationTime: string | null
  celebrantName: string | null
  status: string
  groomBaptismStatus: MarriageDocumentStatus
  brideBaptismStatus: MarriageDocumentStatus
  groomConfirmationStatus: MarriageDocumentStatus
  brideConfirmationStatus: MarriageDocumentStatus
  preparationStatus: MarriageDocumentStatus
  civilStatusStatus: MarriageDocumentStatus
  groomDocuments: number
  brideDocuments: number
  requiredDocuments: number
  publicationCount: number
  publication1Date: string | null
  publication2Date: string | null
  publication3Date: string | null
  oppositionCount: number
  oppositionNote: string | null
  notes: string | null
}

export const bannsApi = {
  async list() {
    const r = await api.get<{ success: boolean; data: MarriageCase[] }>('/administration/banns')
    return r.data.data
  },

  async create(payload: Record<string, unknown>) {
    const r = await api.post<{ success: boolean; data: MarriageCase }>('/administration/banns', payload)
    return r.data.data
  },

  async update(id: string, payload: Record<string, unknown>) {
    await api.patch('/administration/banns/' + id, payload)
  },
}
