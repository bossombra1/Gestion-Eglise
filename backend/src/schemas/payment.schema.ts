import { z } from 'zod'

export const feeCreateSchema = z.object({
  movementId: z.string().uuid(),
  name: z.string().trim().min(2).max(150),
  amount: z.coerce.number().positive().max(100000000),
  dueDate: z.string().datetime().optional(),
})

export const paymentCreateSchema = z.object({
  registrationId: z.string().uuid(),
  feeId: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().uuid().optional(),
  ),
  amount: z.coerce.number().positive().max(100000000),
  method: z.enum(['WAVE', 'ORANGE_MONEY', 'MTN_MONEY', 'MOOV_MONEY', 'CASH', 'OTHER']),
  transactionReference: z.string().trim().max(150).optional(),
})

export type FeeCreateInput = z.infer<typeof feeCreateSchema>
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>
