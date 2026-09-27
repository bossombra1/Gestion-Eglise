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
}
