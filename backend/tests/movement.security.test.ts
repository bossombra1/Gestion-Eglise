import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/repositories/registration.repository', () => ({
  registrationRepository: {
    findManagedById: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

vi.mock('../src/repositories/payment.repository', () => ({
  paymentRepository: {
    findManagedMovement: vi.fn(),
    findManagedRegistration: vi.fn(),
    findManagedFee: vi.fn(),
    getSuccessfulFeeTotal: vi.fn(),
    createFee: vi.fn(),
    createPayment: vi.fn(),
  },
}))

vi.mock('../src/repositories/document.repository', () => ({
  documentRepository: {
    findManagedMovement: vi.fn(),
    findManagedDocument: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../src/repositories/communication.repository', () => ({
  communicationRepository: {
    findManagedMovement: vi.fn(),
    findParentRecipientIds: vi.fn(),
    findMemberRecipientIds: vi.fn(),
    createWithRecipients: vi.fn(),
  },
}))

import { registrationRepository } from '../src/repositories/registration.repository'
import { paymentRepository } from '../src/repositories/payment.repository'
import { documentRepository } from '../src/repositories/document.repository'
import { communicationRepository } from '../src/repositories/communication.repository'
import { registrationService } from '../src/services/registration.service'
import { paymentService } from '../src/services/payment.service'
import { documentService } from '../src/services/document.service'
import { communicationService } from '../src/services/communication.service'

describe('movement security isolation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('blocks approval of an inscription outside the manager scope', async () => {
    vi.mocked(registrationRepository.findManagedById).mockResolvedValue(null)

    await expect(
      registrationService.approve('registration-b', 'manager-a', 'parish-a'),
    ).rejects.toMatchObject({ statusCode: 404 })

    expect(registrationRepository.updateStatus).not.toHaveBeenCalled()
  })

  it('blocks rejection of an inscription outside the manager scope', async () => {
    vi.mocked(registrationRepository.findManagedById).mockResolvedValue(null)

    await expect(
      registrationService.reject('registration-b', 'manager-a', 'parish-a'),
    ).rejects.toMatchObject({ statusCode: 404 })

    expect(registrationRepository.updateStatus).not.toHaveBeenCalled()
  })

  it('blocks payment creation for an inscription outside the manager scope', async () => {
    vi.mocked(paymentRepository.findManagedRegistration).mockResolvedValue(null)

    await expect(
      paymentService.createPayment('manager-a', 'parish-a', {
        registrationId: 'registration-b',
        amount: 5000,
        method: 'CASH',
      }),
    ).rejects.toMatchObject({ statusCode: 404 })

    expect(paymentRepository.createPayment).not.toHaveBeenCalled()
  })

  it('blocks payment on an inactive fee', async () => {
    vi.mocked(paymentRepository.findManagedRegistration).mockResolvedValue({
      id: 'registration-a',
      parishId: 'parish-a',
      movementId: 'movement-a',
    })
    vi.mocked(paymentRepository.findManagedFee).mockResolvedValue(null)

    await expect(
      paymentService.createPayment('manager-a', 'parish-a', {
        registrationId: 'registration-a',
        feeId: 'fee-inactive',
        amount: 5000,
        method: 'CASH',
      }),
    ).rejects.toMatchObject({ statusCode: 400 })

    expect(paymentRepository.getSuccessfulFeeTotal).not.toHaveBeenCalled()
    expect(paymentRepository.createPayment).not.toHaveBeenCalled()
  })

  it('blocks a payment that exceeds the fee amount', async () => {
    vi.mocked(paymentRepository.findManagedRegistration).mockResolvedValue({
      id: 'registration-a',
      parishId: 'parish-a',
      movementId: 'movement-a',
    })
    vi.mocked(paymentRepository.findManagedFee).mockResolvedValue({
      id: 'fee-a',
      movementId: 'movement-a',
      amount: 5000,
      currency: 'XOF',
    } as never)

    await expect(
      paymentService.createPayment('manager-a', 'parish-a', {
        registrationId: 'registration-a',
        feeId: 'fee-a',
        amount: 6000,
        method: 'CASH',
      }),
    ).rejects.toMatchObject({ statusCode: 400 })

    expect(paymentRepository.getSuccessfulFeeTotal).not.toHaveBeenCalled()
    expect(paymentRepository.createPayment).not.toHaveBeenCalled()
  })

  it('blocks a payment that exceeds the remaining fee balance', async () => {
    vi.mocked(paymentRepository.findManagedRegistration).mockResolvedValue({
      id: 'registration-a',
      parishId: 'parish-a',
      movementId: 'movement-a',
    })
    vi.mocked(paymentRepository.findManagedFee).mockResolvedValue({
      id: 'fee-a',
      movementId: 'movement-a',
      amount: 5000,
      currency: 'XOF',
    } as never)
    vi.mocked(paymentRepository.getSuccessfulFeeTotal).mockResolvedValue({
      _sum: { amount: 3000 },
    } as never)

    await expect(
      paymentService.createPayment('manager-a', 'parish-a', {
        registrationId: 'registration-a',
        feeId: 'fee-a',
        amount: 3000,
        method: 'CASH',
      }),
    ).rejects.toMatchObject({ statusCode: 400 })

    expect(paymentRepository.createPayment).not.toHaveBeenCalled()
  })

  it('blocks use of a fee belonging to another movement', async () => {
    vi.mocked(paymentRepository.findManagedRegistration).mockResolvedValue({
      id: 'registration-a',
      parishId: 'parish-a',
      movementId: 'movement-a',
    })
    vi.mocked(paymentRepository.findManagedFee).mockResolvedValue({
      id: 'fee-b',
      movementId: 'movement-b',
    })

    await expect(
      paymentService.createPayment('manager-a', 'parish-a', {
        registrationId: 'registration-a',
        feeId: 'fee-b',
        amount: 5000,
        method: 'CASH',
      }),
    ).rejects.toMatchObject({ statusCode: 400 })

    expect(paymentRepository.createPayment).not.toHaveBeenCalled()
  })

  it('blocks document access outside the manager scope', async () => {
    vi.mocked(documentRepository.findManagedDocument).mockResolvedValue(null)

    await expect(
      documentService.getFile('manager-a', 'document-b', 'parish-a'),
    ).rejects.toMatchObject({ statusCode: 404 })

    await expect(
      documentService.remove('manager-a', 'document-b', 'parish-a'),
    ).rejects.toMatchObject({ statusCode: 404 })

    expect(documentRepository.delete).not.toHaveBeenCalled()
  })

  it('blocks document upload into another movement', async () => {
    vi.mocked(documentRepository.findManagedMovement).mockResolvedValue(null)

    await expect(
      documentService.create({
        userId: 'manager-a',
        parishId: 'parish-a',
        movementId: 'movement-b',
        name: 'Document',
        originalFileName: 'document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('test'),
      }),
    ).rejects.toMatchObject({ statusCode: 403 })

    expect(documentRepository.create).not.toHaveBeenCalled()
  })

  it('blocks communications for another movement', async () => {
    vi.mocked(communicationRepository.findManagedMovement).mockResolvedValue(null)

    await expect(
      communicationService.create('manager-a', 'parish-a', {
        movementId: 'movement-b',
        title: 'Annonce',
        content: 'Message de test',
        type: 'ANNOUNCEMENT',
        audience: 'ALL',
      }),
    ).rejects.toMatchObject({ statusCode: 403 })

    expect(communicationRepository.createWithRecipients).not.toHaveBeenCalled()
  })

  it('blocks communications when the parish is missing', async () => {
    await expect(
      communicationService.create('manager-a', undefined, {
        movementId: 'movement-a',
        title: 'Annonce',
        content: 'Message de test',
        type: 'ANNOUNCEMENT',
        audience: 'ALL',
      }),
    ).rejects.toMatchObject({ statusCode: 403 })

    expect(communicationRepository.findManagedMovement).not.toHaveBeenCalled()
  })
})
