export type UserRole = 'SUPER_ADMIN' | 'ADMIN_PARISH' | 'SECRETARY' | 'PRIEST' | 'MOVEMENT_MANAGER' | 'TREASURER' | 'PARENT' | 'FAITHFUL'

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  role: UserRole
  parishId?: string
  movementId?: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}