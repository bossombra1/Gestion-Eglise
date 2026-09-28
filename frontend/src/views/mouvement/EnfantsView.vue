<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SearchInput from '@/components/molecules/SearchInput.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import EmptyState from '@/components/molecules/EmptyState.vue'
import { useMouvementStore } from '@/stores/mouvement'

const store = useMouvementStore()
const search = ref('')
const movementId = ref('')

const movements = computed(() => {
  const data = store.dashboard?.movements ?? []
  return data.length ? data : (store.movement ? [store.movement] : [])
})

const filteredChildren = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return store.children
  return store.children.filter((child) =>
    `${child.firstName} ${child.lastName}`.toLowerCase().includes(query)
    || child.parentLinks?.some((link) => `${link.parent.firstName} ${link.parent.lastName}`.toLowerCase().includes(query)),
  )
})

async function load() {
  await store.loadChildren(movementId.value ? { movementId: movementId.value } : undefined)
}

onMounted(async () => {
  await Promise.all([store.loadDashboard(), store.loadChildren()])
})

watch(movementId, load)
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="eyebrow text-[#C25A34]">Gestion du mouvement</p>
      <h1 class="mt-1 font-serif text-3xl font-semibold text-[#2E2925]">Enfants inscrits</h1>
      <p class="mt-2 text-sm text-[#6B655D]">Consultez les enfants rattachés à vos mouvements, avec leur responsable familial.</p>
    </div>

    <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
      <SearchInput v-model="search" placeholder="Rechercher un enfant ou un parent…" />
      <label class="block">
        <span class="sr-only">Filtrer par mouvement</span>
        <select v-model="movementId" class="min-h-10 w-full border border-[#C2BAB0] bg-white px-3 text-sm outline-none focus:border-[#24548F]">
          <option value="">Tous mes mouvements</option>
          <option v-for="item in movements" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </label>
    </div>

    <div v-if="store.loading" class="flex min-h-40 items-center justify-center"><AppSpinner /></div>

    <div v-else-if="filteredChildren.length" class="overflow-hidden border border-[#C2BAB0] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="border-b border-[#DDD7CF] bg-[#F7F5F2] text-xs uppercase tracking-wide text-[#6B655D]">
            <tr>
              <th class="px-4 py-3">Enfant</th><th class="px-4 py-3">Mouvement</th><th class="px-4 py-3">Date de naissance</th><th class="px-4 py-3">Parents</th><th class="px-4 py-3">Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="child in filteredChildren" :key="`${child.id}-${child.movement?.id ?? 'all'}`" class="border-b border-[#EDE9E4] last:border-0">
              <td class="px-4 py-3 font-semibold">{{ child.firstName }} {{ child.lastName }}</td>
              <td class="px-4 py-3"><AppBadge>{{ child.movement?.name ?? '—' }}</AppBadge></td>
              <td class="px-4 py-3 text-[#6B655D]">{{ child.birthDate ? new Date(child.birthDate).toLocaleDateString('fr-FR') : '—' }}</td>
              <td class="px-4 py-3">{{ child.parentLinks?.length ?? 0 }}</td>
              <td class="px-4 py-3 text-[#6B655D]">
                <template v-if="child.parentLinks?.[0]?.parent">
                  {{ child.parentLinks[0].parent.phone || child.parentLinks[0].parent.email || '—' }}
                </template>
                <template v-else>—</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <EmptyState v-else title="Aucun enfant trouvé" description="Aucun enfant ne correspond au filtre ou à la recherche actuelle." />
  </section>
</template>
