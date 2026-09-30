import api from './api'
export interface AdministrationMovement {
 id:string; name:string; code:string; description:string|null; status:string; createdAt:string; updatedAt:string
 manager:{id:string;firstName:string;lastName:string;email:string|null;phone:string|null;status:string}|null
 _count:{members:number;registrations:number}
}
export const administrationMovementsApi={
 async list(params?:{search?:string;status?:string}){
  const response=await api.get<{success:boolean;data:AdministrationMovement[]}>('/administration/mouvements',{params})
  return response.data.data
 }
}
