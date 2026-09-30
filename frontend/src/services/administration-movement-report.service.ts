import api from './api'
export interface MovementReport {
 movement:{id:string;name:string;code:string;description:string|null;status:string;createdAt:string;parish:{name:string;code:string};manager:{firstName:string;lastName:string;email:string|null;phone:string|null;status:string}|null}
 period:{type:string;start:string;end:string}
 members:{total:number;active:number;inactive:number;new:number}
 registrations:{total:number;pending:number;approved:number;rejected:number;cancelled:number;completed:number}
 finances:{paymentsCount:number;successfulPayments:number;totalCollected:number;byPaymentMethod:Array<{method:string;amount:number}>;fees:Array<{id:string;name:string;amount:string|number;currency:string;dueDate:string|null;active:boolean}>}
 documents:{count:number;items:Array<{id:string;name:string;type:string;fileName:string;mimeType:string|null;size:number|null;createdAt:string}>}
 communications:{count:number;items:Array<{id:string;title:string;type:string;status:string;sentAt:string|null;createdAt:string}>}
 generatedAt:string
}
export const administrationMovementReportApi={
 async get(id:string,params:{period:'monthly'|'annual';year:number;month?:number}){const response=await api.get<{success:boolean;data:MovementReport}>(`/administration/mouvements/${id}`,{params});return response.data.data},
 async downloadCsv(id:string,params:{period:'monthly'|'annual';year:number;month?:number}){const response=await api.get(`/administration/mouvements/${id}/export/csv`,{params,responseType:'blob'});const url=URL.createObjectURL(response.data);const a=document.createElement('a');a.href=url;a.download='rapport-mouvement.csv';a.click();URL.revokeObjectURL(url)}
}
