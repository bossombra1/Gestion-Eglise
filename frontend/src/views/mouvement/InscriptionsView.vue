<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import { useMouvementStore } from '@/stores/mouvement'
import type { RegistrationStatus } from '@/types/mouvement'

const store = useMouvementStore()
const statusFilter = ref<'ALL' | RegistrationStatus>('PENDING')
const actionLoadingId = ref<string | null>(null)
const rejectId = ref<string | null>(null)
const rejectionReason = ref('')

const filteredRegistrations = computed(() => {
  if (statusFilter.value === 'ALL') return store.registrations
  return store.registrations.filter((item) => item.status === statusFilter.value)
})

const statusLabel = (status: RegistrationStatus) =>
  ({ PENDING: 'En attente', APPROVED: 'Approuvée', REJECTED: 'Refusée', CANCELLED: 'Annulée', COMPLETED: 'Terminée' })[status]

const statusTone = (status: RegistrationStatus) => {
  if (status === 'APPROVED' || status === 'COMPLETED') return 'success'
  if (status === 'PENDING') return 'warning'
  if (status === 'REJECTED' || status === 'CANCELLED') return 'danger'
  return 'neutral'
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value))

const handleApprove = async (id: string) => {
  actionLoadingId.value = id
  try {
    await store.approveRegistration(id)
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
    rejectId.value = null
  } finally {
    actionLoadingId.value = null
  }
}

onMounted(() => store.loadRegistrations())
</script>

<template>
  <section>
    <div class="border-b border-[#C2BAB0] pb-5">
      <p class="eyebrow text-[#C25A34]">Responsable de mouvement</p>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="page-title mt-1 text-4xl text-[#0B1F3A]">Inscriptions</h1>
          <p class="mt-2 text-[#6B655D]">Traitez les demandes d'inscription reçues pour vos mouvements.</p>
        </div>
        <span class="text-sm font-semibold text-[#6B655D]">{{ store.pendingRegistrations }} en attente</span>
      </div>
    </div>

    <div class="mt-6 flex flex-wrap gap-2">
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

    <div v-else class="mt-8 overflow-hidden border border-[#C2BAB0] bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-[#DDD7CF] bg-[#F7F5F2]">
            <tr>
              <th class="px-5 py-4 font-semibold">Enfant</th>
              <th class="px-5 py-4 font-semibold">Parent</th>
              <th class="px-5 py-4 font-semibold">Mouvement</th>
              <th class="px-5 py-4 font-semibold">Demande</th>
              <th class="px-5 py-4 font-semibold">Statut</th>
              <th class="px-5 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registration in filteredRegistrations" :key="registration.id" class="border-b border-[#EDE9E4] last:border-0">
              <td class="px-5 py-4">
                <p class="font-semibold text-[#14345E]">{{ registration.child.firstName }} {{ registration.child.lastName }}</p>
                <p class="mt-1 text-xs text-[#6B655D]">{{ registration.child.gender || 'Informations complémentaires non renseignées' }}</p>
              </td>
              <td class="px-5 py-4">
                <template v-if="registration.child.parentLinks?.length">
                  <div v-for="link in registration.child.parentLinks.slice(0, 1)" :key="link.parent.id">
                    <p>{{ link.parent.firstName }} {{ link.parent.lastName }}</p>
                    <p class="mt-1 text-xs text-[#6B655D]">{{ link.parent.phone || link.parent.email || 'Contact non renseigné' }}</p>
                  </div>
                </template>
                <span v-else class="text-[#6B655D]">Non renseigné</span>
              </td>
              <td class="px-5 py-4">
                <p class="font-semibold">{{ registration.movement.name }}</p>
                <p class="mt-1 text-xs text-[#6B655D]">{{ registration.movement.code }}</p>
              </td>
              <td class="px-5 py-4 text-[#6B655D]">{{ formatDate(registration.registrationDate) }}</td>
              <td class="px-5 py-4"><AppBadge :tone="statusTone(registration.status)">{{ statusLabel(registration.status) }}</AppBadge></td>
              <td class="px-5 py-4">
                <div v-if="registration.status === 'PENDING'" class="flex flex-wrap gap-2">
                  <AppButton :disabled="actionLoadingId === registration.id" @click="handleApprove(registration.id)">
                    {{ actionLoadingId === registration.id ? 'Traitement...' : 'Approuver' }}
                  </AppButton>
                  <AppButton variant="danger" :disabled="actionLoadingId === registration.id" @click="openReject(registration.id)">Refuser</AppButton>
                </div>
                <span v-else class="text-xs text-[#6B655D]">Traitée</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="rejectId" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-lg border border-[#C2BAB0] bg-white p-6 shadow-xl">
        <p class="eyebrow text-[#C25A34]">Refuser une inscription</p>
        <h2 class="page-title mt-1 text-2xl text-[#0B1F3A]">Motif du refus</h2>
        <p class="mt-2 text-sm text-[#6B655D]">Le motif est facultatif, mais il est recommandé pour informer le parent.</p>
        <textarea v-model="rejectionReason" rows="4" maxlength="500" class="mt-5 w-full border border-[#C2BAB0] bg-white p-3 text-sm outline-none focus:border-[#24548F] focus:ring-2 focus:ring-[#24548F]/20" placeholder="Ex. dossier incomplet..." />
        <div class="mt-5 flex justify-end gap-2">
          <AppButton variant="secondary" :disabled="actionLoadingId === rejectId" @click="rejectId = null">Annuler</AppButton>
          <AppButton variant="danger" :disabled="actionLoadingId === rejectId" @click="handleReject">
            {{ actionLoadingId === rejectId ? 'Traitement...' : 'Confirmer le refus' }}
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>
