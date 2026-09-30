import api from './api'
export interface AdministrationActivity{periodDays:number;activeMembers:number;registrationsCount:number;successfulPaymentsCount:number;successfulPaymentsAmount:number;currency:string;registrationTrend:Array<{date:string;count:number}>;recentRegistrations:any[];recentPayments:any[]}
export const administrationActivityApi={async get(params?:{movementId?:string;days?:number}){const r=await api.get<{success:boolean;data:AdministrationActivity}>('/administration/activite',{params});return r.data.data}}
