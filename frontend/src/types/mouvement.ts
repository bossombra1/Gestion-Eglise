export interface MovementSummary {
  id: string
  name: string
  code?: string
  description?: string
  parishId: string
  status?: string
}

export interface MovementChild {
  id: string
  firstName: string
  lastName: string
  birthDate?: string
  registrationStatus?: string
  parentCount?: number
}

export interface MovementParent {
  id: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
}

export type RegistrationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'

export interface RegistrationParent {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
}

export interface RegistrationChild {
  id: string
  firstName: string
  lastName: string
  birthDate?: string | null
  gender?: string | null
  parentLinks?: Array<{
    relationship?: string | null
    isPrimary: boolean
    parent: RegistrationParent
  }>
}

export interface MovementRegistration {
  id: string
  childId: string
  movementId: string
  parishId: string
  status: RegistrationStatus
  registrationDate: string
  approvedAt?: string | null
  rejectedAt?: string | null
  rejectionReason?: string | null
  notes?: string | null
  child: RegistrationChild
  movement: {
    id: string
    name: string
    code: string
    parishId: string
  }
}
