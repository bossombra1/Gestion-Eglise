import { administrationMovementRepository } from '../repositories/administration-movement.repository'
export const administrationMovementService = {
  listMovements(parishId:string, search?:string, status?:string) {
    return administrationMovementRepository.findMovements(parishId, search, status)
  },
}
