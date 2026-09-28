import { describe, expect, it, vi, beforeEach } from 'vitest'
import { movementRepository } from '../src/repositories/movement.repository'

vi.mock('../src/lib/prisma', () => ({
  prisma: {
    movement: {
      findFirst: vi.fn(),
    },
    registration: {
      findFirst: vi.fn(),
    },
    child: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '../src/lib/prisma'

describe('movement authorization isolation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects a movement that is not managed by the current user', async () => {
    vi.mocked(prisma.movement.findFirst).mockResolvedValue(null)

    const result = await movementRepository.findManagedMovement(
      'manager-a',
      'movement-b',
      'parish-a',
    )

    expect(result).toBeNull()
    expect(prisma.movement.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'movement-b',
        managerId: 'manager-a',
        parishId: 'parish-a',
        status: { not: 'ARCHIVED' },
      },
      select: { id: true, name: true, code: true, parishId: true },
    })
  })

  it('does not return a child when the child has no registration in a managed movement', async () => {
    vi.mocked(prisma.registration.findFirst).mockResolvedValue(null)

    const result = await movementRepository.findManagedChild(
      'manager-a',
      'child-b',
      'parish-a',
    )

    expect(result).toBeNull()
    expect(prisma.child.findUnique).not.toHaveBeenCalled()
  })

  it('scopes child authorization to manager and parish', async () => {
    vi.mocked(prisma.registration.findFirst).mockResolvedValue({
      childId: 'child-a',
    } as never)
    vi.mocked(prisma.child.findUnique).mockResolvedValue(null)

    await movementRepository.findManagedChild('manager-a', 'child-a', 'parish-a')

    expect(prisma.registration.findFirst).toHaveBeenCalledWith({
      where: {
        childId: 'child-a',
        movement: {
          managerId: 'manager-a',
          parishId: 'parish-a',
          status: { not: 'ARCHIVED' },
        },
      },
      select: { childId: true },
    })
  })
})
