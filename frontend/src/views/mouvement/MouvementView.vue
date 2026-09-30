<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, ShieldCheck, Users, RefreshCw } from 'lucide-vue-next'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import { useMouvementStore } from '@/stores/mouvement'

const store = useMouvementStore()
const refreshing = ref(false)

const movements = computed(() => {
  const dashboardMovements = store.dashboard?.movements ?? []
  return dashboardMovements.length ? dashboardMovements : store.movement ? [store.movement] : []
})

const totals = computed(() => store.dashboard?.totals ?? {
  movements: 0,
  children: 0,
  activeMembers: 0,
  pendingRegistrations: 0,
  successfulPayments: 0,
  paymentsAmount: 0,
})

const refresh = async () => {
  refreshing.value = true
  try {
    await store.loadDashboard()
    await store.loadMovement()
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  if (!store.dashboard) await store.loadDashboard()
  if (!store.movement) await store.loadMovement()
})
</script>

<template>
  <section class="space-y-6">
    <header class="border-b border-[#C2BAB0] pb-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="eyebrow text-[#C25A34]">Gestion du mouvement</p>
          <h1 class="page-title mt-1 text-3xl sm:text-4xl text-[#0B1F3A]">Mon mouvement</h1>
          <p class="mt-2 text-[#6B655D]">Les mouvements qui vous sont confiés et leur périmètre de gestion.</p>
        </div>
        <button
          type="button"
          class="inline-flex min-h-10 items-center justify-center gap-2 border border-[#C2BAB0] bg-white px-4 text-sm font-semibold text-[#2E2925] hover:bg-[#F2EFEA] disabled:opacity-60"
          :disabled="refreshing"
          @click="refresh"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': refreshing }" />
          {{ refreshing ? 'Actualisation...' : 'Actualiser' }}
        </button>
      </div>
    </header>

    <div v-if="store.loading && !movements.length" class="flex min-h-40 items-center justify-center">
      <AppSpinner />
    </div>

    <div v-else-if="!movements.length" class="border border-dashed border-[#C2BAB0] bg-white p-8 text-center">
      <ShieldCheck class="mx-auto size-8 text-[#C25A34]" />
      <h2 class="page-title mt-3 text-2xl text-[#14345E]">Aucun mouvement attribué</h2>
      <p class="mx-auto mt-2 max-w-lg text-sm text-[#6B655D]">Votre compte ne dispose actuellement d'aucun mouvement géré.</p>
    </div>

    <template v-else>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="border border-[#DDD7CF] bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B655D]">Mouvements gérés</p>
          <p class="mt-1 font-serif text-3xl text-[#14345E]">{{ totals.movements }}</p>
        </div>
        <div class="border border-[#DDD7CF] bg-white p-4">
          <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6B655D]"><Users class="size-4" /> Membres actifs</p>
          <p class="mt-1 font-serif text-3xl text-[#14345E]">{{ totals.activeMembers }}</p>
          <p class="mt-1 text-xs text-[#6B655D]">Total sur votre périmètre.</p>
        </div>
        <div class="border border-[#DDD7CF] bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B655D]">Demandes en attente</p>
          <p class="mt-1 font-serif text-3xl text-[#C25A34]">{{ totals.pendingRegistrations }}</p>
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <article v-for="item in movements" :key="item.id" class="border border-[#C2BAB0] bg-white p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="eyebrow text-[#6B655D]">Mouvement</p>
              <h2 class="page-title mt-1 text-3xl text-[#14345E]">{{ item.name }}</h2>
              <p class="mt-1 text-sm text-[#6B655D]">Code : {{ item.code }}</p>
            </div>
            <AppBadge :tone="item.status === 'ACTIVE' ? 'success' : 'neutral'" class="shrink-0">
              {{ item.status === 'ACTIVE' ? 'Actif' : item.status }}
            </AppBadge>
          </div>

          <div class="mt-6 border border-[#EDE9E4] bg-[#F7F5F2] p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-[#6B655D]">Paroisse</p>
            <p class="mt-2 font-semibold text-[#14345E]">{{ item.parish?.name ?? item.parishId }}</p>
            <p class="mt-1 text-xs text-[#6B655D]">Périmètre paroissial associé au mouvement.</p>
          </div>

          <div class="mt-6 border-t border-[#EDE9E4] pt-5">
            <p class="text-sm leading-6 text-[#6B655D]">{{ item.description || 'Aucune description renseignée pour ce mouvement.' }}</p>
          </div>

          <div class="mt-6 flex flex-wrap gap-2">
            <RouterLink to="/mouvement/enfants" class="inline-flex min-h-10 items-center gap-2 bg-[#14345E] px-4 text-sm font-semibold text-white hover:bg-[#0B1F3A]">
              Voir les enfants <ArrowRight class="size-4" />
            </RouterLink>
            <RouterLink to="/mouvement/communications" class="inline-flex min-h-10 items-center border border-[#C2BAB0] bg-white px-4 text-sm font-semibold text-[#2E2925] hover:bg-[#F2EFEA]">
              Communiquer
            </RouterLink>
          </div>
        </article>
      </div>
    </template>

    <div class="border border-[#DDD7CF] bg-[#F7F5F2] p-5">
      <div class="flex items-start gap-3">
        <ShieldCheck class="mt-0.5 size-5 shrink-0 text-[#14713C]" />
        <div>
          <p class="font-semibold text-[#2E2925]">Périmètre sécurisé</p>
          <p class="mt-1 text-sm leading-6 text-[#6B655D]">Les données de cet espace sont limitées aux mouvements que votre compte est autorisé à gérer.</p>
        </div>
      </div>
    </div>
  </section>
</template>
