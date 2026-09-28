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
  birthDate?: string | null
  gender?: string | null
  registrationStatus?: string
  parentCount?: number
  movement?: { id: string; name: string; code: string }
  parentLinks?: Array<{
    relationship?: string | null
    isPrimary: boolean
    parent: MovementParent
  }>
}

export interface MovementParent {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  email?: string | null
}

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

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
  parentLinks?: Array<{ relationship?: string | null; isPrimary: boolean; parent: RegistrationParent }>
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
  movement: { id: string; name: string; code: string; parishId: string }
}

export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'MTN_MONEY' | 'MOOV_MONEY' | 'CASH' | 'OTHER'

export interface MovementFee {
  id: string
  movementId: string
  name: string
  amount: string | number
  currency: string
  dueDate?: string | null
  active: boolean
  movement: { id: string; name: string; code: string }
}

export interface MovementPayment {
  id: string
  amount: string | number
  currency: string
  method: PaymentMethod
  status: string
  transactionReference?: string | null
  paidAt?: string | null
  registration?: { id: string; status: RegistrationStatus; child: { id: string; firstName: string; lastName: string }; movement: { id: string; name: string; code: string } } | null
  fee?: { id: string; name: string; amount: string | number } | null
}
