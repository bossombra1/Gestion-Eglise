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
}
