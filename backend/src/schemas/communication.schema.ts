import { z } from 'zod'

export const communicationCreateSchema = z.object({
  movementId: z.string().uuid(),
  title: z.string().trim().min(2).max(150),
  content: z.string().trim().min(2).max(10000),
  type: z.enum(['ANNOUNCEMENT', 'MESSAGE', 'INFORMATION', 'REMINDER']).default('ANNOUNCEMENT'),
  audience: z.enum(['PARENTS', 'MEMBERS', 'ALL']).default('ALL'),
})

export type CommunicationCreateInput = z.infer<typeof communicationCreateSchema>
