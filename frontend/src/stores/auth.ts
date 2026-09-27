import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthUser } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(loadUser())
  const token = ref<string | null>(localStorage.getItem('ecclesia_token'))

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const isMovementManager = computed(() => user.value?.role === 'MOVEMENT_MANAGER')

  function setSession(nextToken: string, nextUser: AuthUser) {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem('ecclesia_token', nextToken)
    localStorage.setItem('ecclesia_user', JSON.stringify(nextUser))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('ecclesia_token')
    localStorage.removeItem('ecclesia_user')
  }

  return { user, token, isAuthenticated, isMovementManager, setSession, logout }
})

function loadUser(): AuthUser | null {
  const raw = localStorage.getItem('ecclesia_user')
  if (!raw) return null
  try { return JSON.parse(raw) as AuthUser } catch { return null }
}
