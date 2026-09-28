<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, ShieldCheck, Users } from 'lucide-vue-next'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import { useMouvementStore } from '@/stores/mouvement'

const store = useMouvementStore()

const movements = computed(() => {
  const dashboardMovements = store.dashboard?.movements ?? []
  return dashboardMovements.length
    ? dashboardMovements
    : store.movement
      ? [store.movement]
      : []
})

const memberCount = computed(() => store.dashboard?.totals?.activeMembers ?? 0)

onMounted(async () => {
  if (!store.dashboard) await store.loadDashboard()
  if (!store.movement) await store.loadMovement()
})
</script>

<template>
  <section class="space-y-6">
    <header class="border-b border-[#C2BAB0] pb-5">
      <p class="eyebrow text-[#C25A34]">Gestion du mouvement</p>
      <h1 class="page-title mt-1 text-4xl text-[#0B1F3A]">Mon mouvement</h1>
      <p class="mt-2 text-[#6B655D]">
        Les mouvements qui vous sont confiés et leur périmètre de gestion.
      </p>
    </header>

    <div
      v-if="store.loading && !movements.length"
      class="flex min-h-40 items-center justify-center"
    >
      <AppSpinner />
    </div>

    <div
      v-else-if="!movements.length"
      class="border border-dashed border-[#C2BAB0] bg-white p-8 text-center"
    >
      <ShieldCheck class="mx-auto size-8 text-[#C25A34]" />
      <h2 class="page-title mt-3 text-2xl text-[#14345E]">Aucun mouvement attribué</h2>
      <p class="mx-auto mt-2 max-w-lg text-sm text-[#6B655D]">
        Votre compte ne dispose actuellement d'aucun mouvement géré.
      </p>
    </div>

    <div v-else class="grid gap-5 lg:grid-cols-2">
      <article
        v-for="item in movements"
        :key="item.id"
        class="border border-[#C2BAB0] bg-white p-6"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="eyebrow text-[#6B655D]">Mouvement</p>
            <h2 class="page-title mt-1 text-3xl text-[#14345E]">{{ item.name }}</h2>
            <p class="mt-1 text-sm text-[#6B655D]">Code : {{ item.code }}</p>
          </div>

          <AppBadge
            :tone="item.status === 'ACTIVE' ? 'success' : 'neutral'"
            class="shrink-0"
          >
            {{ item.status === 'ACTIVE' ? 'Actif' : item.status }}
          </AppBadge>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="border border-[#EDE9E4] bg-[#F7F5F2] p-4">
            <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#6B655D]">
              <Users class="size-4" />
              Membres actifs
            </p>
            <p class="mt-2 text-2xl font-semibold text-[#0B1F3A]">{{ memberCount }}</p>
            <p class="mt-1 text-xs text-[#6B655D]">
              Membres actuellement actifs dans votre périmètre.
            </p>
          </div>

          <div class="border border-[#EDE9E4] bg-[#F7F5F2] p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-[#6B655D]">
              Paroisse
            </p>
            <p class="mt-2 font-semibold text-[#14345E]">
              {{ item.parishId }}
            </p>
            <p class="mt-1 text-xs text-[#6B655D]">
              Périmètre paroissial associé au mouvement.
            </p>
          </div>
        </div>

        <div class="mt-6 border-t border-[#EDE9E4] pt-5">
          <p class="text-sm leading-6 text-[#6B655D]">
            {{ item.description || 'Aucune description renseignée pour ce mouvement.' }}
          </p>
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <RouterLink
            to="/mouvement/enfants"
            class="inline-flex min-h-10 items-center gap-2 bg-[#14345E] px-4 text-sm font-semibold text-white hover:bg-[#0B1F3A]"
          >
            Voir les enfants
            <ArrowRight class="size-4" />
          </RouterLink>

          <RouterLink
            to="/mouvement/communications"
            class="inline-flex min-h-10 items-center border border-[#C2BAB0] bg-white px-4 text-sm font-semibold text-[#2E2925] hover:bg-[#F2EFEA]"
          >
            Communiquer
          </RouterLink>
        </div>
      </article>
    </div>

    <div class="border border-[#DDD7CF] bg-[#F7F5F2] p-5">
      <div class="flex items-start gap-3">
        <ShieldCheck class="mt-0.5 size-5 shrink-0 text-[#14713C]" />
        <div>
          <p class="font-semibold text-[#2E2925]">Périmètre sécurisé</p>
          <p class="mt-1 text-sm leading-6 text-[#6B655D]">
            Les données de cet espace sont limitées aux mouvements que votre compte est autorisé à gérer.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
