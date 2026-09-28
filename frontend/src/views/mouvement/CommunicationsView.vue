
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import EmptyState from '@/components/molecules/EmptyState.vue'
import SearchInput from '@/components/molecules/SearchInput.vue'
import { useMouvementStore } from '@/stores/mouvement'
import type { MovementCommunicationAudience, MovementCommunicationType, MovementSummary } from '@/types/mouvement'

const store = useMouvementStore()
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const search = ref('')
const form = ref({
  movementId: '',
  title: '',
  content: '',
  type: 'ANNOUNCEMENT' as MovementCommunicationType,
  audience: 'ALL' as MovementCommunicationAudience,
})

const movements = computed<MovementSummary[]>(() => store.dashboard?.movements ?? [])
const filteredCommunications = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return store.communications
  return store.communications.filter((item) =>
    item.title.toLowerCase().includes(query) ||
    item.content.toLowerCase().includes(query) ||
    item.movement?.name.toLowerCase().includes(query),
  )
})

const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'

const submit = async () => {
  error.value = null
  success.value = null
  if (!form.value.movementId) {
    error.value = 'Sélectionnez un mouvement.'
    return
  }

  saving.value = true
  try {
    await store.createCommunication(form.value)
    success.value = 'Communication envoyée aux destinataires sélectionnés.'
    form.value = { movementId: form.value.movementId, title: '', content: '', type: 'ANNOUNCEMENT', audience: 'ALL' }
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Impossible d’envoyer la communication.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await store.loadDashboard()
    form.value.movementId = movements.value[0]?.id ?? ''
    await store.loadCommunications()
  } catch {
    error.value = 'Impossible de charger les communications.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="space-y-6">
    <div class="border-b border-[#C2BAB0] pb-5">
      <p class="eyebrow text-[#C25A34]">Responsable de mouvement</p>
      <h1 class="page-title mt-1 text-4xl text-[#0B1F3A]">Communications</h1>
      <p class="mt-2 text-[#6B655D]">Diffusez les informations du mouvement et consultez l’historique des communications envoyées.</p>
    </div>

    <div v-if="loading" class="flex min-h-40 items-center justify-center"><AppSpinner /></div>

    <template v-else>
      <div v-if="error" class="border border-[#B3261E] bg-[#FCE5E3] p-4 text-sm text-[#8F1E18]">{{ error }}</div>
      <div v-if="success" class="border border-[#14713C] bg-[#E4F2E9] p-4 text-sm text-[#14713C]">{{ success }}</div>

      <article class="border border-[#C2BAB0] bg-white p-6">
        <p class="eyebrow text-[#6B655D]">Nouvelle communication</p>
        <h2 class="page-title mt-1 text-2xl text-[#14345E]">Envoyer un message</h2>

        <form class="mt-5 grid gap-4 md:grid-cols-2" @submit.prevent="submit">
          <label class="block text-sm font-semibold">Mouvement
            <select v-model="form.movementId" required class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal">
              <option value="" disabled>Sélectionner</option>
              <option v-for="movement in movements" :key="movement.id" :value="movement.id">{{ movement.name }}</option>
            </select>
          </label>

          <label class="block text-sm font-semibold">Destinataires
            <select v-model="form.audience" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal">
              <option value="ALL">Parents + membres</option>
              <option value="PARENTS">Parents</option>
              <option value="MEMBERS">Membres du mouvement</option>
            </select>
          </label>

          <label class="block text-sm font-semibold">Type
            <select v-model="form.type" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal">
              <option value="ANNOUNCEMENT">Annonce</option>
              <option value="INFORMATION">Information</option>
              <option value="MESSAGE">Message</option>
              <option value="REMINDER">Rappel</option>
            </select>
          </label>

          <label class="block text-sm font-semibold">Titre
            <input v-model="form.title" required minlength="2" maxlength="150" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" placeholder="Réunion du samedi" />
          </label>

          <label class="block text-sm font-semibold md:col-span-2">Contenu
            <textarea v-model="form.content" required minlength="2" maxlength="10000" rows="6" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" placeholder="Écrivez votre communication…"></textarea>
          </label>

          <div class="md:col-span-2">
            <AppButton type="submit" :disabled="saving || !form.movementId">{{ saving ? 'Envoi...' : 'Envoyer la communication' }}</AppButton>
          </div>
        </form>
      </article>

      <article class="overflow-hidden border border-[#C2BAB0] bg-white">
        <div class="flex flex-col gap-4 border-b border-[#DDD7CF] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="eyebrow text-[#6B655D]">Historique</p>
            <h2 class="page-title mt-1 text-2xl text-[#14345E]">Communications envoyées</h2>
          </div>
          <SearchInput v-model="search" placeholder="Rechercher…" />
        </div>

        <div v-if="store.communicationsLoading" class="flex min-h-32 items-center justify-center"><AppSpinner /></div>
        <EmptyState v-else-if="!filteredCommunications.length" title="Aucune communication" description="Aucune communication envoyée ne correspond à votre recherche." />

        <div v-else class="hidden overflow-x-auto md:block">
          <table class="min-w-[900px] w-full text-left text-sm">
            <thead class="border-b border-[#DDD7CF] bg-[#F7F5F2] text-xs uppercase tracking-wide text-[#6B655D]">
              <tr>
                <th class="px-5 py-4">Titre</th>
                <th class="px-5 py-4">Mouvement</th>
                <th class="px-5 py-4">Type</th>
                <th class="px-5 py-4">Destinataires</th>
                <th class="px-5 py-4">Envoyée le</th>
                <th class="px-5 py-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredCommunications" :key="item.id" class="border-t border-[#EDE9E4]">
                <td class="px-5 py-4">
                  <p class="font-semibold">{{ item.title }}</p>
                  <p class="mt-1 max-w-md truncate text-xs text-[#6B655D]">{{ item.content }}</p>
                </td>
                <td class="px-5 py-4"><AppBadge>{{ item.movement?.name ?? '—' }}</AppBadge></td>
                <td class="px-5 py-4">{{ item.type }}</td>
                <td class="px-5 py-4">{{ item.recipients?.length ?? 0 }}</td>
                <td class="px-5 py-4 text-[#6B655D]">{{ formatDate(item.sentAt ?? item.createdAt) }}</td>
                <td class="px-5 py-4"><AppBadge tone="success">{{ item.status === 'SENT' ? 'Envoyée' : item.status }}</AppBadge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
      <div v-if="!store.communicationsLoading && filteredCommunications.length" class="grid gap-3 md:hidden">
        <article v-for="item in filteredCommunications" :key="item.id" class="border border-[#C2BAB0] bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0"><p class="font-semibold text-[#2E2925]">{{ item.title }}</p><p class="mt-1 line-clamp-2 text-xs leading-5 text-[#6B655D]">{{ item.content }}</p></div>
            <AppBadge tone="success">{{ item.status === 'SENT' ? 'Envoyée' : item.status }}</AppBadge>
          </div>
          <div class="mt-4 grid gap-2 text-xs text-[#6B655D]"><span>{{ item.movement?.name ?? '—' }} · {{ item.type }}</span><span>{{ item.recipients?.length ?? 0 }} destinataire{{ (item.recipients?.length ?? 0) > 1 ? 's' : '' }}</span><span>{{ formatDate(item.sentAt ?? item.createdAt) }}</span></div>
        </article>
      </div>
    </template>
  </section>
</template>
