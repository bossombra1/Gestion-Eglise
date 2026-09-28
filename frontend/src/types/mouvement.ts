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

export interface MovementChildRegistration {
  id: string
  movementId: string
  status: RegistrationStatus
  registrationDate: string
  approvedAt?: string | null
  rejectedAt?: string | null
  rejectionReason?: string | null
  notes?: string | null
  movement: { id: string; name: string; code: string }
}

export interface MovementChildDetail extends MovementChild {
  medicalInformation?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  family?: {
    id: string
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
  } | null
  parentLinks: Array<{
    relationship?: string | null
    isPrimary: boolean
    parent: MovementParent & { status?: string }
  }>
  registrations: MovementChildRegistration[]
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

export type MovementDocumentType =
  | 'GENERAL'
  | 'REGISTRATION'
  | 'MEDICAL'
  | 'ADMINISTRATIVE'
  | 'FINANCIAL'
  | 'COMMUNICATION'
  | 'OTHER'

export interface MovementDocument {
  id: string
  name: string
  description?: string | null
  type: MovementDocumentType
  fileName: string
  mimeType?: string | null
  size?: number | null
  movementId: string
  createdAt: string
  updatedAt: string
  movement?: { id: string; name: string; code: string } | null
  uploadedBy?: { id: string; firstName: string; lastName: string } | null
}

export type MovementCommunicationType = 'ANNOUNCEMENT' | 'MESSAGE' | 'INFORMATION' | 'REMINDER'
export type MovementCommunicationAudience = 'PARENTS' | 'MEMBERS' | 'ALL'

export interface MovementCommunication {
  id: string
  title: string
  content: string
  type: MovementCommunicationType
  status: 'DRAFT' | 'SENT' | 'ARCHIVED'
  movementId: string
  sentAt?: string | null
  createdAt: string
  movement?: { id: string; name: string; code: string } | null
  sender?: { id: string; firstName: string; lastName: string } | null
  recipients?: Array<{ userId: string; readAt?: string | null }>
}
