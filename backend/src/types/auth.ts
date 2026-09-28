export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN_PARISH'
  | 'SECRETARY'
  | 'PRIEST'
  | 'MOVEMENT_MANAGER'
  | 'TREASURER'
  | 'PARENT'
  | 'FAITHFUL'

export interface AuthenticatedUser {
  id: string
  role: UserRole
  parishId?: string
  movementId?: string
}
