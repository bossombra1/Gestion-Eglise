export interface MovementSummary {
  id: string
  name: string
  description?: string
  parishId: string
  active: boolean
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
