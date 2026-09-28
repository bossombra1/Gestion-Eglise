import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { mouvementService } from '@/services/mouvement.service'
import type {
  MovementChild,
  MovementChildDetail,
  MovementCommunication,
  MovementDocument,
  MovementParent,
  MovementRegistration,
  MovementSummary,
  RegistrationStatus,
} from '@/types/mouvement'

export const useMouvementStore = defineStore('mouvement', () => {
  const movement = ref<MovementSummary | null>(null)
  const children = ref<MovementChild[]>([])
  const selectedChild = ref<MovementChildDetail | null>(null)
  const childDetailLoading = ref(false)
  const parents = ref<MovementParent[]>([])
  const registrations = ref<MovementRegistration[]>([])
  const fees = ref<import('@/types/mouvement').MovementFee[]>([])
  const payments = ref<import('@/types/mouvement').MovementPayment[]>([])
  const documents = ref<MovementDocument[]>([])
  const communications = ref<MovementCommunication[]>([])
  const loading = ref(false)
  const dashboard = ref<{
    movements: MovementSummary[]
    totals: {
      movements: number
      children: number
      activeMembers: number
      pendingRegistrations: number
      successfulPayments: number
      paymentsAmount: number
    }
  } | null>(null)
  const registrationsLoading = ref(false)
  const documentsLoading = ref(false)
  const communicationsLoading = ref(false)
  const error = ref<string | null>(null)
  const hasMovement = computed(() => Boolean(movement.value))
  const pendingRegistrations = computed(
    () => registrations.value.filter((item) => item.status === 'PENDING').length,
  )

  async function loadDashboard() {
    const response = await mouvementService.getDashboard()
    dashboard.value = response.data ?? response
    if (!movement.value && dashboard.value?.movements?.[0]) {
      movement.value = dashboard.value.movements[0]
    }
  }

  async function loadMovement() {
    loading.value = true
    error.value = null
    try {
      const response = await mouvementService.getMovement()
      const data = response.data ?? response
      movement.value = Array.isArray(data) ? data[0] ?? null : data
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

  async function loadChild(id: string) {
    childDetailLoading.value = true
    error.value = null
    try {
      const response = await mouvementService.getChild(id)
      selectedChild.value = response.data ?? response
      return selectedChild.value
    } catch (err) {
      error.value = 'Impossible de charger la fiche de cet enfant.'
      selectedChild.value = null
      throw err
    } finally {
      childDetailLoading.value = false
    }
  }

  function clearSelectedChild() {
    selectedChild.value = null
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

  async function loadFees() {
    const response = await mouvementService.getFees()
    fees.value = response.data ?? response
  }

  async function loadPayments() {
    const response = await mouvementService.getPayments()
    payments.value = response.data ?? response
  }

  async function loadDocuments(movementId?: string) {
    documentsLoading.value = true
    error.value = null
    try {
      const response = await mouvementService.getDocuments(movementId)
      documents.value = response.data ?? response
    } catch (err) {
      error.value = 'Impossible de charger les documents.'
      throw err
    } finally {
      documentsLoading.value = false
    }
  }

  async function loadCommunications() {
    communicationsLoading.value = true
    error.value = null
    try {
      const response = await mouvementService.getCommunications()
      communications.value = response.data ?? response
    } catch (err) {
      error.value = 'Impossible de charger les communications.'
      throw err
    } finally {
      communicationsLoading.value = false
    }
  }

  async function createCommunication(input: {
    movementId: string
    title: string
    content: string
    type: string
    audience: string
  }) {
    await mouvementService.createCommunication(input)
    await loadCommunications()
  }

  async function createFee(input: { movementId: string; name: string; amount: number; dueDate?: string }) {
    await mouvementService.createFee(input)
    await loadFees()
  }

  async function updateFee(input: { id: string; name: string; amount: number; dueDate?: string; active?: boolean }) {
    await mouvementService.updateFee(input)
    await loadFees()
  }

  async function deleteFee(id: string) {
    const response = await mouvementService.deleteFee(id)
    await loadFees()
    return response.data ?? response
  }

  async function createPayment(input: { registrationId: string; feeId?: string; amount: number; method: string; transactionReference?: string }) {
    await mouvementService.createPayment(input)
    await loadPayments()
  }

  async function uploadDocument(input: {
    movementId: string
    name: string
    description?: string
    type: string
    file: File
  }) {
    await mouvementService.uploadDocument(input)
    await loadDocuments(input.movementId)
  }

  async function deleteDocument(id: string, movementId?: string) {
    await mouvementService.deleteDocument(id)
    await loadDocuments(movementId)
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
    selectedChild,
    parents,
    registrations,
    fees,
    payments,
    documents,
    communications,
    loading,
    registrationsLoading,
    documentsLoading,
    communicationsLoading,
    childDetailLoading,
    error,
    hasMovement,
    pendingRegistrations,
    loadMovement,
    dashboard,
    loadDashboard,
    loadChildren,
    loadChild,
    clearSelectedChild,
    loadParents,
    loadRegistrations,
    loadFees,
    loadPayments,
    loadDocuments,
    createFee,
    updateFee,
    deleteFee,
    createPayment,
    uploadDocument,
    deleteDocument,
    loadCommunications,
    createCommunication,
    approveRegistration,
    rejectRegistration,
  }
})
