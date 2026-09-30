import api from './api'

export interface AdministrationSettings {
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  description: string | null
}

export async function getAdministrationSettings(): Promise<AdministrationSettings> {
  const response = await api.get<{ success: boolean; data: AdministrationSettings }>('/administration/overview/settings')
  return response.data.data
}


export async function updateAdministrationSettings(payload: AdministrationSettings): Promise<AdministrationSettings> {
  const response = await api.patch<{ success: boolean; data: AdministrationSettings }>('/administration/overview/settings', payload)
  return response.data.data
}
