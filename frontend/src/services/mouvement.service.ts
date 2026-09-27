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

  async rejectRegistration(id: string, rejectionReason?: string) {
    const { data } = await api.patch('/registrations/' + id + '/reject', {
      rejectionReason,
    })
    return data
  },
}
