import { administrationActivityRepository } from '../repositories/administration-activity.repository'
export const administrationActivityService={getActivity:(parishId:string,movementId?:string,days?:number)=>administrationActivityRepository.getActivity(parishId,movementId,days)}
