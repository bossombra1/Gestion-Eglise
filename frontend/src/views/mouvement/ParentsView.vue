<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SearchInput from '@/components/molecules/SearchInput.vue'
import EmptyState from '@/components/molecules/EmptyState.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import { useMouvementStore } from '@/stores/mouvement'

const store = useMouvementStore()
const search = ref('')
const movementId = ref('')

const movements = computed(() => store.dashboard?.movements ?? (store.movement ? [store.movement] : []))
const filteredParents = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return store.parents
  return store.parents.filter((parent) =>
    `${parent.firstName} ${parent.lastName}`.toLowerCase().includes(query)
    || (parent.phone ?? '').toLowerCase().includes(query)
    || (parent.email ?? '').toLowerCase().includes(query),
  )
})

async function load() {
  await store.loadParents(movementId.value ? { movementId: movementId.value } : undefined)
}

onMounted(async () => {
  await Promise.all([store.loadDashboard(), store.loadParents()])
})

watch(movementId, load)
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="eyebrow text-[#C25A34]">Gestion du mouvement</p>
      <h1 class="mt-1 font-serif text-3xl font-semibold text-[#2E2925]">Parents</h1>
      <p class="mt-2 text-sm text-[#6B655D]">Retrouvez les parents associés aux enfants de vos mouvements.</p>
    </div>

    <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
      <SearchInput v-model="search" placeholder="Rechercher un parent, téléphone ou e-mail…" />
      <label class="block">
        <span class="sr-only">Filtrer par mouvement</span>
        <select v-model="movementId" class="min-h-10 w-full border border-[#C2BAB0] bg-white px-3 text-sm outline-none focus:border-[#24548F]">
          <option value="">Tous mes mouvements</option>
          <option v-for="item in movements" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </label>
    </div>

    <div v-if="store.loading" class="flex min-h-40 items-center justify-center"><AppSpinner /></div>

    <div v-else-if="filteredParents.length" class="overflow-hidden border border-[#C2BAB0] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[680px] text-left text-sm">
          <thead class="border-b border-[#DDD7CF] bg-[#F7F5F2] text-xs uppercase tracking-wide text-[#6B655D]">
            <tr><th class="px-4 py-3">Parent</th><th class="px-4 py-3">Téléphone</th><th class="px-4 py-3">E-mail</th><th class="px-4 py-3">Statut</th></tr>
          </thead>
          <tbody>
            <tr v-for="parent in filteredParents" :key="parent.id" class="border-b border-[#EDE9E4] last:border-0">
              <td class="px-4 py-3 font-semibold">{{ parent.firstName }} {{ parent.lastName }}</td>
              <td class="px-4 py-3">{{ parent.phone || '—' }}</td>
              <td class="px-4 py-3 text-[#6B655D]">{{ parent.email || '—' }}</td>
              <td class="px-4 py-3"><span class="inline-flex rounded-full bg-[#E4F2E9] px-2.5 py-1 text-xs font-semibold text-[#14713C]">Actif</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <EmptyState v-else title="Aucun parent trouvé" description="Aucun parent ne correspond au filtre ou à la recherche actuelle." />
  </section>
</template>
