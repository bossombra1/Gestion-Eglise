import { administrationRepository } from '../repositories/administration.repository'

export const administrationService = {
  getDashboard(parishId: string) {
    return administrationRepository.getDashboard(parishId)
  },
}
