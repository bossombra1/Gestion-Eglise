import api from './api'

export interface SacramentalAct {
  id: string
  parishId: string
  personFirstName: string
  personLastName: string
  personBirthDate: string | null
  type: string
  status: string
  celebrationDate: string
  place: string | null
  celebrantName: string | null
  registerNumber: string | null
  certificateNumber: string | null
  notes: string | null
  annotations: string | null
}

export interface SacramentalActPayload {
  personFirstName: string
  personLastName: string
  personBirthDate: string
  type: string
  celebrationDate: string
  celebrantName: string
  place: string
  registerNumber: string
  certificateNumber: string
  notes: string
}

export const sacramentalApi = {
  async list(q?: string) {
    const r = await api.get<{ success: boolean; data: { acts: SacramentalAct[] } }>(
      '/administration/sacramental',
      { params: q ? { q } : undefined },
    )
    return r.data.data
  },

  async create(payload: SacramentalActPayload) {
    const r = await api.post<{ success: boolean; data: SacramentalAct }>(
      '/administration/sacramental',
      payload,
    )
    return r.data.data
  },

  async update(id: string, payload: Partial<SacramentalActPayload> & Record<string, unknown>) {
    await api.patch('/administration/sacramental/' + id, payload)
  },
}
