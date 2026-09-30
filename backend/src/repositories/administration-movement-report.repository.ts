import { prisma } from '../lib/prisma'

type Period = { start: Date; end: Date }

export const administrationMovementReportRepository = {
  async getMovement(parishId: string, movementId: string) {
    return prisma.movement.findFirst({
      where: { id: movementId, parishId },
      select: {
        id: true, name: true, code: true, description: true, status: true, createdAt: true,
        manager: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true } },
        parish: { select: { id: true, name: true, code: true } },
      },
    })
  },

  async getReportData(parishId: string, movementId: string, period: Period) {
    const base = { movementId, createdAt: { gte: period.start, lt: period.end } }
    const [members, registrations, payments, documents, communications, fees] = await Promise.all([
      prisma.movementMember.findMany({
        where: { movementId },
        select: { status: true, joinedAt: true, leftAt: true, createdAt: true, user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.registration.findMany({
        where: { ...base, parishId },
        select: { status: true, registrationDate: true, approvedAt: true, rejectedAt: true, child: { select: { firstName: true, lastName: true } } },
        orderBy: { registrationDate: 'desc' },
      }),
      prisma.payment.findMany({
        where: {
          parishId,
          createdAt: { gte: period.start, lt: period.end },
          OR: [
            { registration: { movementId } },
            { fee: { movementId } },
          ],
        },
        select: { amount: true, currency: true, method: true, status: true, paidAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.findMany({
        where: { parishId, movementId, createdAt: { gte: period.start, lt: period.end } },
        select: { id: true, name: true, type: true, fileName: true, mimeType: true, size: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.communication.findMany({
        where: { parishId, movementId, createdAt: { gte: period.start, lt: period.end } },
        select: { id: true, title: true, type: true, status: true, sentAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.movementFee.findMany({
        where: { movementId },
        select: { id: true, name: true, amount: true, currency: true, dueDate: true, active: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])
    return { members, registrations, payments, documents, communications, fees }
  },
}
