import { administrationMovementReportRepository } from '../repositories/administration-movement-report.repository'

function getPeriod(period: string | undefined, year: number, month?: number) {
  if (period === 'annual') return { start: new Date(Date.UTC(year, 0, 1)), end: new Date(Date.UTC(year + 1, 0, 1)) }
  const safeMonth = Math.min(12, Math.max(1, month ?? new Date().getUTCMonth() + 1))
  return { start: new Date(Date.UTC(year, safeMonth - 1, 1)), end: new Date(Date.UTC(year, safeMonth, 1)) }
}

export const administrationMovementReportService = {
  async generate(parishId: string, movementId: string, periodType = 'monthly', year = new Date().getUTCFullYear(), month?: number) {
    const movement = await administrationMovementReportRepository.getMovement(parishId, movementId)
    if (!movement) return null

    const period = getPeriod(periodType, year, month)
    const raw = await administrationMovementReportRepository.getReportData(parishId, movementId, period)

    const activeMembers = raw.members.filter((m) => m.status === 'ACTIVE').length
    const newMembers = raw.members.filter((m) => m.joinedAt && m.joinedAt >= period.start && m.joinedAt < period.end).length
    const inactiveMembers = raw.members.filter((m) => m.status === 'INACTIVE' || m.status === 'REMOVED').length
    const successfulPayments = raw.payments.filter((p) => p.status === 'SUCCESS')
    const totalCollected = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    const byPaymentMethod = Object.entries(successfulPayments.reduce<Record<string, number>>((acc, p) => {
      acc[p.method] = (acc[p.method] ?? 0) + Number(p.amount)
      return acc
    }, {})).map(([method, amount]) => ({ method, amount }))

    return {
      movement,
      period: { type: periodType === 'annual' ? 'annual' : 'monthly', start: period.start, end: period.end },
      members: { total: raw.members.length, active: activeMembers, inactive: inactiveMembers, new: newMembers },
      registrations: {
        total: raw.registrations.length,
        pending: raw.registrations.filter((r) => r.status === 'PENDING').length,
        approved: raw.registrations.filter((r) => r.status === 'APPROVED').length,
        rejected: raw.registrations.filter((r) => r.status === 'REJECTED').length,
        cancelled: raw.registrations.filter((r) => r.status === 'CANCELLED').length,
        completed: raw.registrations.filter((r) => r.status === 'COMPLETED').length,
      },
      finances: { paymentsCount: raw.payments.length, successfulPayments: successfulPayments.length, totalCollected, byPaymentMethod, fees: raw.fees },
      documents: { count: raw.documents.length, items: raw.documents },
      communications: { count: raw.communications.length, items: raw.communications },
      recentRegistrations: raw.registrations.slice(0, 10),
      generatedAt: new Date(),
    }
  },

  async csv(parishId: string, movementId: string, periodType: string, year: number, month?: number) {
    const report = await this.generate(parishId, movementId, periodType, year, month)
    if (!report) return null
    const rows = [
      ['Section', 'Indicateur', 'Valeur'],
      ['Mouvement', 'Nom', report.movement.name],
      ['Mouvement', 'Code', report.movement.code],
      ['Période', 'Début', report.period.start.toISOString()],
      ['Période', 'Fin', report.period.end.toISOString()],
      ['Membres', 'Total', report.members.total],
      ['Membres', 'Actifs', report.members.active],
      ['Membres', 'Inactifs / retirés', report.members.inactive],
      ['Membres', 'Nouveaux', report.members.new],
      ['Inscriptions', 'Total', report.registrations.total],
      ['Inscriptions', 'En attente', report.registrations.pending],
      ['Inscriptions', 'Approuvées', report.registrations.approved],
      ['Inscriptions', 'Rejetées', report.registrations.rejected],
      ['Inscriptions', 'Annulées', report.registrations.cancelled],
      ['Inscriptions', 'Terminées', report.registrations.completed],
      ['Finances', 'Paiements réussis', report.finances.successfulPayments],
      ['Finances', 'Montant encaissé', report.finances.totalCollected],
      ['Documents', 'Documents ajoutés', report.documents.count],
      ['Communications', 'Communications', report.communications.count],
    ]
    return rows.map((row) => row.map((v) => {
      const value = String(v ?? '')
      return /[;"\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value
    }).join(';')).join('\n')
  },
}
