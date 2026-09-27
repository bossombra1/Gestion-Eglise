import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { mouvementService } from '@/services/mouvement.service'
import type { MovementChild, MovementParent, MovementSummary } from '@/types/mouvement'

export const useMouvementStore = defineStore('mouvement', () => {
  const movement = ref<MovementSummary | null>(null)
  const children = ref<MovementChild[]>([])
  const parents = ref<MovementParent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasMovement = computed(() => Boolean(movement.value))

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

  return { movement, children, parents, loading, error, hasMovement, loadMovement, loadChildren, loadParents }
})
