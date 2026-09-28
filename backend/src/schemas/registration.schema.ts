import { z } from 'zod'

export const registrationListSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']).optional(),
})

export const registrationDecisionSchema = z.object({
  rejectionReason: z.string().trim().min(3).max(500).optional(),
})

export type RegistrationListInput = z.infer<typeof registrationListSchema>
export type RegistrationDecisionInput = z.infer<typeof registrationDecisionSchema>
