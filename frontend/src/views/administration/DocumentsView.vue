<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Download, FileText, RefreshCw } from 'lucide-vue-next'
import { administrationDocumentsApi, type AdministrationDocument } from '@/services/administration-documents.service'
import { administrationMovementsApi, type AdministrationMovement } from '@/services/administration-movements.service'

const documents = ref<AdministrationDocument[]>([])
const movements = ref<AdministrationMovement[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const type = ref('')
const movementId = ref('')
const downloading = ref<string | null>(null)

const typeLabels: Record<string, string> = { GENERAL: 'Général', REGISTRATION: 'Inscription', MEDICAL: 'Médical', ADMINISTRATIVE: 'Administratif', FINANCIAL: 'Financier', COMMUNICATION: 'Communication', OTHER: 'Autre' }

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    documents.value = await administrationDocumentsApi.list({ search: search.value || undefined, type: type.value || undefined, movementId: movementId.value || undefined })
  } catch {
    error.value = 'Impossible de charger les documents.'
  } finally { loading.value = false }
}

const formatSize = (size?: number | null) => {
  if (!size) return '—'
  if (size < 1024) return size + ' o'
  if (size < 1024 * 1024) return Math.round(size / 1024) + ' Ko'
  return (size / (1024 * 1024)).toFixed(1) + ' Mo'
}
const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value))

const download = async (item: AdministrationDocument) => {
  downloading.value = item.id
  try {
    const blob = await administrationDocumentsApi.download(item.id)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = item.fileName
    anchor.click()
    URL.revokeObjectURL(url)
  } catch {
    error.value = 'Impossible de télécharger ce document.'
  } finally { downloading.value = null }
}

onMounted(async () => {
  try { movements.value = await administrationMovementsApi.list() } catch {}
  await load()
})
</script>

<template>
  <section class="space-y-6">
    <header class="border border-[#C2BAB0] bg-white p-5 sm:p-7">
      <p class="text-xs font-semibold uppercase tracking-[.16em] text-[#C25A34]">Supervision paroissiale</p>
      <h1 class="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Documents</h1>
      <p class="mt-2 text-sm text-[#6B655D]">Consultez les documents partagés dans l’ensemble de la paroisse.</p>
    </header>

    <div class="grid gap-3 md:grid-cols-[1fr_220px_240px_auto]">
      <input v-model="search" @keyup.enter="load" placeholder="Rechercher un document…" class="min-h-11 border border-[#C2BAB0] bg-white px-3 text-sm" />
      <select v-model="type" @change="load" class="min-h-11 border border-[#C2BAB0] bg-white px-3 text-sm"><option value="">Tous les types</option><option v-for="(label,key) in typeLabels" :key="key" :value="key">{{ label }}</option></select>
      <select v-model="movementId" @change="load" class="min-h-11 border border-[#C2BAB0] bg-white px-3 text-sm"><option value="">Tous les mouvements</option><option v-for="movement in movements" :key="movement.id" :value="movement.id">{{ movement.name }}</option></select>
      <button @click="load" class="inline-flex min-h-11 items-center justify-center gap-2 border border-[#C2BAB0] bg-white px-4 text-sm font-semibold"><RefreshCw class="size-4" :class="{ 'animate-spin': loading }" /> Actualiser</button>
    </div>

    <div v-if="error" class="border border-[#B3261E]/30 bg-[#FFF5F4] p-4 text-sm text-[#B3261E]">{{ error }}</div>
    <div v-if="loading" class="border border-[#C2BAB0] bg-white p-8 text-sm text-[#6B655D]">Chargement...</div>
    <div v-else class="overflow-hidden border border-[#C2BAB0] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="bg-[#F7F5F2] text-xs uppercase tracking-wide text-[#6B655D]"><tr><th class="px-4 py-3">Document</th><th class="px-4 py-3">Mouvement</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Ajouté par</th><th class="px-4 py-3">Date</th><th class="px-4 py-3">Taille</th><th class="px-4 py-3">Action</th></tr></thead>
          <tbody class="divide-y divide-[#EDE9E4]">
            <tr v-for="item in documents" :key="item.id">
              <td class="px-4 py-3"><p class="font-semibold">{{ item.name }}</p><p class="text-xs text-[#6B655D]">{{ item.fileName }}</p></td>
              <td class="px-4 py-3">{{ item.movement?.name || 'Paroisse' }}</td>
              <td class="px-4 py-3">{{ typeLabels[item.type] || item.type }}</td>
              <td class="px-4 py-3">{{ item.uploadedBy.firstName }} {{ item.uploadedBy.lastName }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(item.createdAt) }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ formatSize(item.size) }}</td>
              <td class="px-4 py-3"><button @click="download(item)" :disabled="downloading === item.id" class="inline-flex items-center gap-2 border border-[#C2BAB0] px-3 py-2 text-xs font-semibold hover:bg-[#F7F5F2]"><Download class="size-4" />{{ downloading === item.id ? 'Téléchargement…' : 'Télécharger' }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!documents.length" class="p-10 text-center"><FileText class="mx-auto size-8 text-[#C2BAB0]" /><p class="mt-3 text-sm text-[#6B655D]">Aucun document trouvé.</p></div>
    </div>
  </section>
</template>
