<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bell, CalendarDays, Megaphone, RefreshCw, Search } from 'lucide-vue-next'
import api from '@/services/api'

type Communication = {
  id: string | number
  title?: string
  content?: string
  status?: string
  createdAt?: string
  movement?: { name?: string }
}

const loading = ref(true)
const error = ref('')
const data = ref<Communication[]>([])
const search = ref('')
const statusFilter = ref('all')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/administration/overview/communications')
    data.value = Array.isArray(response.data?.data) ? response.data.data : []
  } catch {
    error.value = 'Impossible de charger les communications.'
  } finally {
    loading.value = false
  }
}

const filteredCommunications = computed(() => {
  const query = search.value.trim().toLowerCase()
  return data.value.filter((item) => {
    const matchesSearch = !query ||
      (item.title ?? '').toLowerCase().includes(query) ||
      (item.content ?? '').toLowerCase().includes(query) ||
      (item.movement?.name ?? 'Paroisse').toLowerCase().includes(query)
    const matchesStatus = statusFilter.value === 'all' || (item.status ?? '').toLowerCase() === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const formatDate = (value?: string) => {
  if (!value) return 'Date inconnue'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date inconnue' : new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(date)
}

const statusLabel = (status?: string) => {
  const normalized = (status ?? '').toLowerCase()
  if (normalized === 'published') return 'Publié'
  if (normalized === 'draft') return 'Brouillon'
  if (normalized === 'archived') return 'Archivé'
  return status || 'Non précisé'
}

const statusClass = (status?: string) => {
  const normalized = (status ?? '').toLowerCase()
  if (normalized === 'published') return 'bg-[#EAF4EE] text-[#21613A]'
  if (normalized === 'draft') return 'bg-[#FFF4E8] text-[#9A5A18]'
  return 'bg-[#F1F1F1] text-[#5E5A55]'
}

onMounted(load)
</script>

<template>
  <section class="space-y-6">
    <header class="border border-[#C2BAB0] bg-white p-5 sm:p-7">
      <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[.16em] text-[#C25A34]">Vie paroissiale</p>
          <h1 class="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Communications</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-[#6B655D]">Consultez les annonces et communications diffusées par la paroisse et les mouvements.</p>
        </div>
        <div class="flex items-center gap-2 border border-[#DDD7CF] bg-[#F7F5F2] px-4 py-3 text-sm text-[#5E5A55]">
          <Bell class="size-4 text-[#24548F]" />
          <span><strong class="text-[#0B1F3A]">{{ data.length }}</strong> communication{{ data.length > 1 ? 's' : '' }}</span>
        </div>
      </div>
    </header>

    <div class="grid gap-3 border border-[#DDD7CF] bg-[#F7F5F2] p-4 md:grid-cols-[1fr_auto_auto]">
      <label class="flex min-h-11 items-center gap-2 border border-[#C2BAB0] bg-white px-3">
        <Search class="size-4 shrink-0 text-[#6B655D]" />
        <input v-model="search" type="search" placeholder="Rechercher une communication..." class="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </label>
      <select v-model="statusFilter" class="min-h-11 border border-[#C2BAB0] bg-white px-3 text-sm">
        <option value="all">Tous les statuts</option>
        <option value="published">Publiées</option>
        <option value="draft">Brouillons</option>
        <option value="archived">Archivées</option>
      </select>
      <button @click="load" class="inline-flex min-h-11 items-center justify-center gap-2 border border-[#C2BAB0] bg-white px-4 text-sm font-semibold text-[#0B1F3A]" aria-label="Actualiser">
        <RefreshCw class="size-4" :class="{ 'animate-spin': loading }" /> Actualiser
      </button>
    </div>

    <div v-if="loading" class="grid gap-3 md:grid-cols-2">
      <div v-for="item in 4" :key="item" class="animate-pulse border border-[#DDD7CF] bg-white p-5">
        <div class="h-5 w-2/3 bg-[#EEEAE4]"></div><div class="mt-4 h-3 w-full bg-[#EEEAE4]"></div><div class="mt-2 h-3 w-5/6 bg-[#EEEAE4]"></div><div class="mt-6 h-3 w-1/3 bg-[#EEEAE4]"></div>
      </div>
    </div>
    <div v-else-if="error" class="border border-[#B3261E]/30 bg-[#FFF5F4] p-5 text-sm text-[#B3261E]">{{ error }}</div>
    <div v-else-if="!filteredCommunications.length" class="border border-[#C2BAB0] bg-white p-10 text-center">
      <Megaphone class="mx-auto size-8 text-[#24548F]" />
      <h2 class="mt-3 font-serif text-xl text-[#0B1F3A]">Aucune communication</h2>
      <p class="mt-2 text-sm text-[#6B655D]">{{ data.length ? 'Aucun résultat ne correspond à vos filtres.' : 'Aucune communication n’est disponible pour le moment.' }}</p>
    </div>
    <div v-else class="grid gap-4 lg:grid-cols-2">
      <article v-for="item in filteredCommunications" :key="item.id" class="border border-[#C2BAB0] bg-white p-5 transition hover:border-[#24548F]">
        <div class="flex items-start justify-between gap-4">
          <div class="flex min-w-0 items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center bg-[#EAF0F7] text-[#24548F]"><Megaphone class="size-5" /></div>
            <div class="min-w-0"><h2 class="font-serif text-xl leading-tight text-[#14345E]">{{ item.title || 'Sans titre' }}</h2><p class="mt-1 text-xs text-[#6B655D]">{{ item.movement?.name || 'Paroisse' }}</p></div>
          </div>
          <span class="shrink-0 px-2.5 py-1 text-[11px] font-semibold" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
        </div>
        <p class="mt-5 line-clamp-4 text-sm leading-6 text-[#5E5A55]">{{ item.content || 'Aucun contenu.' }}</p>
        <div class="mt-5 flex items-center gap-2 border-t border-[#EEEAE4] pt-4 text-xs text-[#6B655D]"><CalendarDays class="size-4" />{{ formatDate(item.createdAt) }}</div>
      </article>
    </div>
  </section>
</template>
