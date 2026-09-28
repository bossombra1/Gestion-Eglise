import { beforeEach, describe, expect, it, vi } from 'vitest'

const prisma = {
  movement: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  registration: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
  },
  movementFee: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
  },
  payment: {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
}

vi.mock('../src/lib/prisma', () => ({ prisma }))

import { movementRepository } from '../src/repositories/movement.repository'
import { registrationRepository } from '../src/repositories/registration.repository'
import { paymentRepository } from '../src/repositories/payment.repository'

describe('Responsable Mouvement — périmètre et sécurité', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prisma.movement.findMany.mockResolvedValue([])
    prisma.movement.findFirst.mockResolvedValue(null)
    prisma.registration.findMany.mockResolvedValue([])
    prisma.registration.findFirst.mockResolvedValue(null)
    prisma.movementFee.findMany.mockResolvedValue([])
    prisma.movementFee.findFirst.mockResolvedValue(null)
    prisma.payment.findMany.mockResolvedValue([])
  })

  it('limite les mouvements au responsable, à la paroisse et exclut les archives', async () => {
    await movementRepository.findManagedMovements('manager-1', 'parish-1')

    expect(prisma.movement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          managerId: 'manager-1',
          parishId: 'parish-1',
          status: { not: 'ARCHIVED' },
        },
      }),
    )
  })

  it('refuse un mouvement qui ne correspond pas au responsable ou à la paroisse', async () => {
    await movementRepository.findManagedMovement('manager-1', 'movement-other', 'parish-1')

    expect(prisma.movement.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'movement-other',
          managerId: 'manager-1',
          parishId: 'parish-1',
          status: { not: 'ARCHIVED' },
        },
      }),
    )
  })

  it('limite les inscriptions aux mouvements actifs du responsable', async () => {
    await registrationRepository.findManaged('manager-1', 'parish-1')

    expect(prisma.registration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          movement: {
            managerId: 'manager-1',
            parishId: 'parish-1',
            status: { not: 'ARCHIVED' },
          },
        },
      }),
    )
  })

  it('protège une inscription ciblée contre le changement de mouvement ou de paroisse', async () => {
    await registrationRepository.findManagedById('registration-other', 'manager-1', 'parish-1')

    expect(prisma.registration.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'registration-other',
          movement: {
            managerId: 'manager-1',
            parishId: 'parish-1',
            status: { not: 'ARCHIVED' },
          },
        },
      }),
    )
  })

  it('limite les cotisations aux mouvements actifs du responsable', async () => {
    await paymentRepository.findManagedFees('manager-1', 'parish-1')

    expect(prisma.movementFee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          active: true,
          movement: {
            managerId: 'manager-1',
            parishId: 'parish-1',
            status: { not: 'ARCHIVED' },
          },
        },
      }),
    )
  })

  it('protège une cotisation avant modification ou suppression', async () => {
    await paymentRepository.findManagedFeeForUpdate('manager-1', 'parish-1', 'fee-other')

    expect(prisma.movementFee.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'fee-other',
          movement: {
            managerId: 'manager-1',
            parishId: 'parish-1',
            status: { not: 'ARCHIVED' },
          },
        },
      }),
    )
  })

  it('protège la création de paiement via l’inscription et le mouvement géré', async () => {
    await paymentRepository.findManagedRegistration('manager-1', 'parish-1', 'registration-other')

    expect(prisma.registration.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'registration-other',
          status: { in: ['APPROVED', 'COMPLETED'] },
          movement: {
            managerId: 'manager-1',
            parishId: 'parish-1',
            status: { not: 'ARCHIVED' },
          },
        },
      }),
    )
  })

  it('protège une cotisation utilisée pour un paiement', async () => {
    await paymentRepository.findManagedFee('manager-1', 'parish-1', 'fee-other')

    expect(prisma.movementFee.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'fee-other',
          active: true,
          movement: {
            managerId: 'manager-1',
            parishId: 'parish-1',
            status: { not: 'ARCHIVED' },
          },
        },
      }),
    )
  })

  it('ne retourne l’historique que pour les cotisations actives du périmètre', async () => {
    await paymentRepository.findManagedPayments('manager-1', 'parish-1')

    expect(prisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          fee: {
            is: {
              active: true,
              movement: {
                managerId: 'manager-1',
                parishId: 'parish-1',
                status: { not: 'ARCHIVED' },
              },
            },
          },
        },
      }),
    )
  })

  it('supprime les paiements liés avant la cotisation dans une transaction', async () => {
    const tx = {
      payment: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
      movementFee: { delete: vi.fn().mockResolvedValue({ id: 'fee-1' }) },
    }
    prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx))

    await paymentRepository.deleteFeeWithPayments('fee-1')

    expect(tx.payment.deleteMany).toHaveBeenCalledWith({ where: { feeId: 'fee-1' } })
    expect(tx.movementFee.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'fee-1' } }))
  })
})
