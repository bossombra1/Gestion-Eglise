import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '@/services/auth.service'
import type { AuthUser } from '@/types/auth'

const TOKEN_KEY = 'ecclesia_token'
const USER_KEY = 'ecclesia_user'

function readUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as AuthUser } catch { return null }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY))
  const user = ref<AuthUser | null>(readUser())
  const loading = ref(false)
  const error = ref('')

  function clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    token.value = null
    user.value = null
  }

  function persist(nextToken: string, nextUser: AuthUser) {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    token.value = nextToken
    user.value = nextUser
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      const result = await authService.login(email, password)
      persist(result.accessToken, result.user)
      return true
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Identifiants invalides.'
      clear()
      return false
    } finally {
      loading.value = false
    }
  }

  async function restoreSession() {
    if (!token.value) return false
    try {
      const currentUser = await authService.me()
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
      user.value = currentUser
      return true
    } catch {
      clear()
      return false
    }
  }

  function logout() { clear() }

  return { token, user, loading, error, login, restoreSession, logout }
})