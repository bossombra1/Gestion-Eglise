import api from './api'

export interface AdministrationUser {
  id:string; firstName:string; lastName:string; email:string|null; phone:string|null; role:string; status:string; createdAt:string; updatedAt:string
}
export const administrationUsersApi = {
  async list(params?: {search?:string; role?:string; status?:string}) {
    const response = await api.get<{success:boolean;data:AdministrationUser[]}>('/administration/users',{params})
    return response.data.data
  },
}
