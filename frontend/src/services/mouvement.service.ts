import api from './api'

export const mouvementService = {
  async getDashboard() {
    const { data } = await api.get('/movements/me/dashboard')
    return data
  },

  async getMovement() {
    const { data } = await api.get('/movements/me')
    return data
  },

  async getChildren(params?: Record<string, unknown>) {
    const { data } = await api.get('/movements/me/children', { params })
    return data
  },

  async getParents(params?: Record<string, unknown>) {
    const { data } = await api.get('/movements/me/parents', { params })
    return data
  },

  async getRegistrations(params?: { status?: string }) {
    const { data } = await api.get('/registrations/me', { params })
    return data
  },

  async approveRegistration(id: string) {
    const { data } = await api.patch('/registrations/' + id + '/approve')
    return data
  },

  async getFees() {
    const { data } = await api.get('/payments/fees')
    return data
  },

  async createFee(input: { movementId: string; name: string; amount: number; dueDate?: string }) {
    const { data } = await api.post('/payments/fees', input)
    return data
  },

  async getPayments() {
    const { data } = await api.get('/payments')
    return data
  },

  async createPayment(input: { registrationId: string; feeId?: string; amount: number; method: string; transactionReference?: string }) {
    const { data } = await api.post('/payments', input)
    return data
  },

  async rejectRegistration(id: string, rejectionReason?: string) {
    const { data } = await api.patch('/registrations/' + id + '/reject', {
      rejectionReason,
    })
    return data
  },

  async getDocuments(movementId?: string) {
    const { data } = await api.get('/documents', {
      params: movementId ? { movementId } : undefined,
    })
    return data
  },

  async uploadDocument(input: {
    movementId: string
    name: string
    description?: string
    type: string
    file: File
  }) {
    const { data } = await api.post('/documents', input.file, {
      headers: {
        'Content-Type': input.file.type || 'application/octet-stream',
        'X-Movement-Id': input.movementId,
        'X-Document-Name': input.name,
        'X-Document-Description': input.description ?? '',
        'X-Document-Type': input.type,
        'X-File-Name': input.file.name,
        'X-File-Type': input.file.type || 'application/octet-stream',
      },
    })
    return data
  },

  async downloadDocument(id: string) {
    const { data, headers } = await api.get('/documents/' + id + '/download', {
      responseType: 'blob',
    })
    return { blob: data as Blob, contentDisposition: headers['content-disposition'] as string | undefined }
  },

  async deleteDocument(id: string) {
    const { data } = await api.delete('/documents/' + id)
    return data
  },
}
