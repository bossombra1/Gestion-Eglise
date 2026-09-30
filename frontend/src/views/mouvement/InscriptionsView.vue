<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import { useMouvementStore } from '@/stores/mouvement'
import type { MovementRegistration, RegistrationStatus } from '@/types/mouvement'

const store = useMouvementStore()
const statusFilter = ref<'ALL' | RegistrationStatus>('PENDING')
const actionLoadingId = ref<string | null>(null)
const rejectId = ref<string | null>(null)
const selectedRegistration = ref<MovementRegistration | null>(null)
const rejectionReason = ref('')

const filteredRegistrations = computed(() => statusFilter.value === 'ALL'
  ? store.registrations
  : store.registrations.filter((item) => item.status === statusFilter.value))

const counts = computed(() => ({
  pending: store.registrations.filter((item) => item.status === 'PENDING').length,
  approved: store.registrations.filter((item) => item.status === 'APPROVED' || item.status === 'COMPLETED').length,
  rejected: store.registrations.filter((item) => item.status === 'REJECTED').length,
  total: store.registrations.length,
}))

const statusLabel = (status: RegistrationStatus) =>
  ({ PENDING: 'En attente', APPROVED: 'Approuvée', REJECTED: 'Refusée', CANCELLED: 'Annulée', COMPLETED: 'Terminée' })[status]

const statusTone = (status: RegistrationStatus) => {
  if (status === 'APPROVED' || status === 'COMPLETED') return 'success'
  if (status === 'PENDING') return 'warning'
  if (status === 'REJECTED' || status === 'CANCELLED') return 'danger'
  return 'neutral'
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date)
}

const primaryParent = (registration: MovementRegistration) =>
  registration.child.parentLinks?.find((link) => link.isPrimary)?.parent ??
  registration.child.parentLinks?.[0]?.parent ??
  null

const openDetails = (registration: MovementRegistration) => { selectedRegistration.value = registration }

const handleApprove = async (id: string) => {
  actionLoadingId.value = id
  try {
    await store.approveRegistration(id)
    if (selectedRegistration.value?.id === id) selectedRegistration.value = null
  } finally {
    actionLoadingId.value = null
  }
}

const openReject = (id: string) => {
  rejectId.value = id
  rejectionReason.value = ''
}

const handleReject = async () => {
  if (!rejectId.value) return
  actionLoadingId.value = rejectId.value
  try {
    await store.rejectRegistration(rejectId.value, rejectionReason.value.trim() || undefined)
    if (selectedRegistration.value?.id === rejectId.value) selectedRegistration.value = null
    rejectId.value = null
  } finally {
    actionLoadingId.value = null
  }
}

const refresh = async () => { await store.loadRegistrations() }

onMounted(refresh)
</script>

<template>
  <section>
    <div class="border-b border-[#C2BAB0] pb-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="eyebrow text-[#C25A34]">Responsable de mouvement</p>
          <h1 class="page-title mt-1 text-3xl sm:text-4xl text-[#0B1F3A]">Inscriptions</h1>
          <p class="mt-2 text-[#6B655D]">Consultez les demandes et validez l'arrivée des enfants dans vos mouvements.</p>
        </div>
        <AppButton variant="secondary" :disabled="store.registrationsLoading" @click="refresh">
          {{ store.registrationsLoading ? 'Actualisation...' : 'Actualiser' }}
        </AppButton>
      </div>
    </div>

    <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <button
        v-for="card in [
          { value: 'PENDING', label: 'En attente', count: counts.pending },
          { value: 'APPROVED', label: 'Approuvées', count: counts.approved },
          { value: 'REJECTED', label: 'Refusées', count: counts.rejected },
          { value: 'ALL', label: 'Total', count: counts.total },
        ]"
        :key="card.value"
        type="button"
        class="border bg-white p-4 text-left transition hover:border-[#24548F]"
        :class="statusFilter === card.value ? 'border-[#24548F] ring-2 ring-[#24548F]/10' : 'border-[#DDD7CF]'"
        @click="statusFilter = card.value as 'ALL' | RegistrationStatus"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B655D]">{{ card.label }}</p>
        <p class="mt-1 font-serif text-3xl text-[#14345E]">{{ card.count }}</p>
      </button>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <AppButton
        v-for="option in [
          { value: 'PENDING', label: 'En attente' },
          { value: 'ALL', label: 'Toutes' },
          { value: 'APPROVED', label: 'Approuvées' },
          { value: 'REJECTED', label: 'Refusées' },
        ]"
        :key="option.value"
        :variant="statusFilter === option.value ? 'primary' : 'secondary'"
        @click="statusFilter = option.value as 'ALL' | RegistrationStatus"
      >
        {{ option.label }}
      </AppButton>
    </div>

    <div v-if="store.registrationsLoading" class="mt-8 flex justify-center py-12"><AppSpinner /></div>

    <div v-else-if="store.error" class="mt-8 border border-[#B3261E] bg-[#FCE5E3] p-5 text-sm text-[#8F1E18]">
      {{ store.error }}
    </div>

    <div v-else-if="!filteredRegistrations.length" class="mt-8 border border-dashed border-[#C2BAB0] bg-white p-8 text-center">
      <p class="font-serif text-2xl text-[#14345E]">Aucune inscription</p>
      <p class="mt-2 text-sm text-[#6B655D]">
        {{ statusFilter === 'PENDING' ? 'Aucune demande ne nécessite actuellement votre intervention.' : 'Aucune inscription ne correspond à ce filtre.' }}
      </p>
    </div>

    <div v-else class="mt-8">
      <div class="hidden overflow-hidden border border-[#C2BAB0] bg-white md:block">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-[#DDD7CF] bg-[#F7F5F2]">
              <tr>
                <th class="px-5 py-4 font-semibold">Enfant</th><th class="px-5 py-4 font-semibold">Parent</th>
                <th class="px-5 py-4 font-semibold">Mouvement</th><th class="px-5 py-4 font-semibold">Demande</th>
                <th class="px-5 py-4 font-semibold">Statut</th><th class="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="registration in filteredRegistrations" :key="registration.id" class="border-b border-[#EDE9E4] last:border-0">
                <td class="px-5 py-4">
                  <button type="button" class="text-left" @click="openDetails(registration)">
                    <p class="font-semibold text-[#14345E] hover:underline">{{ registration.child.firstName }} {{ registration.child.lastName }}</p>
                    <p class="mt-1 text-xs text-[#6B655D]">{{ registration.child.gender || 'Genre non renseigné' }}</p>
                  </button>
                </td>
                <td class="px-5 py-4">
                  <template v-if="primaryParent(registration)">
                    <p>{{ primaryParent(registration)!.firstName }} {{ primaryParent(registration)!.lastName }}</p>
                    <p class="mt-1 text-xs text-[#6B655D]">{{ primaryParent(registration)!.phone || primaryParent(registration)!.email || 'Contact non renseigné' }}</p>
                  </template>
                  <span v-else class="text-[#6B655D]">Non renseigné</span>
                </td>
                <td class="px-5 py-4"><p class="font-semibold">{{ registration.movement.name }}</p><p class="mt-1 text-xs text-[#6B655D]">{{ registration.movement.code }}</p></td>
                <td class="px-5 py-4 text-[#6B655D]">{{ formatDate(registration.registrationDate) }}</td>
                <td class="px-5 py-4"><AppBadge :tone="statusTone(registration.status)">{{ statusLabel(registration.status) }}</AppBadge></td>
                <td class="px-5 py-4">
                  <div v-if="registration.status === 'PENDING'" class="flex flex-wrap gap-2">
                    <AppButton :disabled="actionLoadingId === registration.id" @click="handleApprove(registration.id)">{{ actionLoadingId === registration.id ? 'Traitement...' : 'Approuver' }}</AppButton>
                    <AppButton variant="danger" :disabled="actionLoadingId === registration.id" @click="openReject(registration.id)">Refuser</AppButton>
                  </div>
                  <button v-else type="button" class="text-sm font-semibold text-[#24548F] hover:underline" @click="openDetails(registration)">Voir le détail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid gap-3 md:hidden">
        <article v-for="registration in filteredRegistrations" :key="registration.id" class="border border-[#C2BAB0] bg-white p-4">
          <button type="button" class="w-full text-left" @click="openDetails(registration)">
            <div class="flex items-start justify-between gap-3">
              <div><p class="font-semibold text-[#14345E]">{{ registration.child.firstName }} {{ registration.child.lastName }}</p><p class="mt-1 text-xs text-[#6B655D]">{{ registration.movement.name }}</p></div>
              <AppBadge :tone="statusTone(registration.status)">{{ statusLabel(registration.status) }}</AppBadge>
            </div>
          </button>
          <div class="mt-4 grid gap-2 text-sm">
            <p><span class="text-[#6B655D]">Parent :</span> {{ primaryParent(registration)?.firstName ?? '—' }} {{ primaryParent(registration)?.lastName ?? '' }}</p>
            <p><span class="text-[#6B655D]">Demande :</span> {{ formatDate(registration.registrationDate) }}</p>
            <p v-if="primaryParent(registration)?.phone" class="text-[#6B655D]">{{ primaryParent(registration)?.phone }}</p>
          </div>
          <div v-if="registration.status === 'PENDING'" class="mt-4 grid grid-cols-2 gap-2">
            <AppButton :disabled="actionLoadingId === registration.id" @click="handleApprove(registration.id)">{{ actionLoadingId === registration.id ? 'Traitement...' : 'Approuver' }}</AppButton>
            <AppButton variant="danger" :disabled="actionLoadingId === registration.id" @click="openReject(registration.id)">Refuser</AppButton>
          </div>
        </article>
      </div>
    </div>

    <div v-if="selectedRegistration" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" @click.self="selectedRegistration = null">
      <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#C2BAB0] bg-white shadow-xl">
        <div class="border-b border-[#DDD7CF] p-6">
          <div class="flex items-start justify-between gap-4">
            <div><p class="eyebrow text-[#C25A34]">Détail de la demande</p><h2 class="page-title mt-1 text-2xl text-[#0B1F3A]">{{ selectedRegistration.child.firstName }} {{ selectedRegistration.child.lastName }}</h2></div>
            <AppBadge :tone="statusTone(selectedRegistration.status)">{{ statusLabel(selectedRegistration.status) }}</AppBadge>
          </div>
        </div>
        <div class="grid gap-6 p-6 sm:grid-cols-2">
          <div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B655D]">Enfant</p><dl class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between gap-4"><dt class="text-[#6B655D]">Nom</dt><dd class="font-medium text-right">{{ selectedRegistration.child.firstName }} {{ selectedRegistration.child.lastName }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-[#6B655D]">Naissance</dt><dd class="font-medium text-right">{{ formatDate(selectedRegistration.child.birthDate) }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-[#6B655D]">Genre</dt><dd class="font-medium text-right">{{ selectedRegistration.child.gender || '—' }}</dd></div>
          </dl></div>
          <div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B655D]">Parent référent</p><dl class="mt-3 space-y-2 text-sm">
            <template v-if="primaryParent(selectedRegistration)"><div class="flex justify-between gap-4"><dt class="text-[#6B655D]">Nom</dt><dd class="font-medium text-right">{{ primaryParent(selectedRegistration)!.firstName }} {{ primaryParent(selectedRegistration)!.lastName }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-[#6B655D]">Téléphone</dt><dd class="font-medium text-right">{{ primaryParent(selectedRegistration)!.phone || '—' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-[#6B655D]">Email</dt><dd class="font-medium text-right">{{ primaryParent(selectedRegistration)!.email || '—' }}</dd></div></template>
            <p v-else class="text-sm text-[#6B655D]">Aucun parent lié à cette demande.</p>
          </dl></div>
          <div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B655D]">Mouvement</p><p class="mt-3 font-semibold text-[#14345E]">{{ selectedRegistration.movement.name }}</p><p class="mt-1 text-sm text-[#6B655D]">{{ selectedRegistration.movement.code }}</p></div>
          <div><p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B655D]">Dates</p><dl class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between gap-4"><dt class="text-[#6B655D]">Demande</dt><dd class="font-medium text-right">{{ formatDate(selectedRegistration.registrationDate) }}</dd></div>
            <div v-if="selectedRegistration.approvedAt" class="flex justify-between gap-4"><dt class="text-[#6B655D]">Approbation</dt><dd class="font-medium text-right">{{ formatDate(selectedRegistration.approvedAt) }}</dd></div>
            <div v-if="selectedRegistration.rejectedAt" class="flex justify-between gap-4"><dt class="text-[#6B655D]">Refus</dt><dd class="font-medium text-right">{{ formatDate(selectedRegistration.rejectedAt) }}</dd></div>
          </dl></div>
          <div v-if="selectedRegistration.rejectionReason" class="sm:col-span-2 border border-[#DDD7CF] bg-[#F7F5F2] p-4"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B655D]">Motif du refus</p><p class="mt-2 text-sm">{{ selectedRegistration.rejectionReason }}</p></div>
          <div v-if="selectedRegistration.notes" class="sm:col-span-2 border border-[#DDD7CF] bg-[#F7F5F2] p-4"><p class="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B655D]">Notes</p><p class="mt-2 whitespace-pre-wrap text-sm">{{ selectedRegistration.notes }}</p></div>
        </div>
        <div class="flex flex-wrap justify-end gap-2 border-t border-[#DDD7CF] p-6">
          <AppButton variant="secondary" @click="selectedRegistration = null">Fermer</AppButton>
          <template v-if="selectedRegistration.status === 'PENDING'">
            <AppButton variant="danger" :disabled="actionLoadingId === selectedRegistration.id" @click="openReject(selectedRegistration.id)">Refuser</AppButton>
            <AppButton :disabled="actionLoadingId === selectedRegistration.id" @click="handleApprove(selectedRegistration.id)">{{ actionLoadingId === selectedRegistration.id ? 'Traitement...' : 'Approuver' }}</AppButton>
          </template>
        </div>
      </div>
    </div>

    <div v-if="rejectId" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="rejectId = null">
      <div class="w-full max-w-lg border border-[#C2BAB0] bg-white p-6 shadow-xl">
        <p class="eyebrow text-[#C25A34]">Refuser une inscription</p><h2 class="page-title mt-1 text-2xl text-[#0B1F3A]">Motif du refus</h2>
        <p class="mt-2 text-sm text-[#6B655D]">Le motif est facultatif, mais il est recommandé pour informer le parent.</p>
        <textarea v-model="rejectionReason" rows="4" maxlength="500" class="mt-5 w-full border border-[#C2BAB0] bg-white p-3 text-sm outline-none focus:border-[#24548F] focus:ring-2 focus:ring-[#24548F]/20" placeholder="Ex. dossier incomplet..." />
        <p class="mt-1 text-right text-xs text-[#6B655D]">{{ rejectionReason.length }}/500</p>
        <div class="mt-5 flex justify-end gap-2">
          <AppButton variant="secondary" :disabled="actionLoadingId === rejectId" @click="rejectId = null">Annuler</AppButton>
          <AppButton variant="danger" :disabled="actionLoadingId === rejectId" @click="handleReject">{{ actionLoadingId === rejectId ? 'Traitement...' : 'Confirmer le refus' }}</AppButton>
        </div>
      </div>
    </div>
  </section>
</template>
