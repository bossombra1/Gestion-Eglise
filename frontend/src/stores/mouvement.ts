import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { mouvementService } from '@/services/mouvement.service'
import type {
  MovementChild,
  MovementParent,
  MovementRegistration,
  MovementSummary,
  RegistrationStatus,
} from '@/types/mouvement'

export const useMouvementStore = defineStore('mouvement', () => {
  const movement = ref<MovementSummary | null>(null)
  const children = ref<MovementChild[]>([])
  const parents = ref<MovementParent[]>([])
  const registrations = ref<MovementRegistration[]>([])
  const loading = ref(false)
  const registrationsLoading = ref(false)
  const error = ref<string | null>(null)
  const hasMovement = computed(() => Boolean(movement.value))
  const pendingRegistrations = computed(
    () => registrations.value.filter((item) => item.status === 'PENDING').length,
  )

  async function loadMovement() {
    loading.value = true
    error.value = null
    try {
      const response = await mouvementService.getMovement()
      movement.value = response.data ?? response
    } catch (err) {
      error.value = 'Impossible de charger les informations du mouvement.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadChildren(params?: Record<string, unknown>) {
    const response = await mouvementService.getChildren(params)
    children.value = response.data ?? response
  }

  async function loadParents(params?: Record<string, unknown>) {
    const response = await mouvementService.getParents(params)
    parents.value = response.data ?? response
  }

  async function loadRegistrations(status?: RegistrationStatus) {
    registrationsLoading.value = true
    error.value = null
    try {
      const response = await mouvementService.getRegistrations(status ? { status } : undefined)
      registrations.value = response.data ?? response
    } catch (err) {
      error.value = 'Impossible de charger les inscriptions.'
      throw err
    } finally {
      registrationsLoading.value = false
    }
  }

  async function approveRegistration(id: string) {
    await mouvementService.approveRegistration(id)
    await loadRegistrations()
  }

  async function rejectRegistration(id: string, rejectionReason?: string) {
    await mouvementService.rejectRegistration(id, rejectionReason)
    await loadRegistrations()
  }

  return {
    movement,
    children,
    parents,
    registrations,
    loading,
    registrationsLoading,
    error,
    hasMovement,
    pendingRegistrations,
    loadMovement,
    loadChildren,
    loadParents,
    loadRegistrations,
    approveRegistration,
    rejectRegistration,
  }
})
