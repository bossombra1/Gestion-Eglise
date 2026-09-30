import { administrationRegistrationRepository } from '../repositories/administration-registration.repository'
export const administrationRegistrationService={list:(parishId:string,movementId?:string,status?:string,days?:number)=>administrationRegistrationRepository.list(parishId,movementId,status,days)}
