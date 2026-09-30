import api from './api'

export interface AdministrationDashboard {
  parish: { id: string; name: string; code: string }
  users: { total: number; active: number }
  movements: { total: number; active: number }
  registrations: { total: number; pending: number; approved: number; rejected: number }
  massIntentions: { total: number; pending: number; confirmed: number; completed: number }
  movementActivity: Array<{
    id: string
    name: string
    code: string
    status: string
    _count: { members: number; registrations: number }
  }>
}

export const administrationApi = {
  async getDashboard() {
    const response = await api.get<{ success: boolean; data: AdministrationDashboard }>('/administration/dashboard')
    return response.data.data
  },
}
