import api from './api'
import type { AuthUser, LoginResponse } from '@/types/auth'

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post<{ success: boolean; data: LoginResponse }>('/auth/login', { email, password })
    return data.data
  },
  async me() {
    const { data } = await api.get<{ success: boolean; data: AuthUser }>('/auth/me')
    return data.data
  },
}