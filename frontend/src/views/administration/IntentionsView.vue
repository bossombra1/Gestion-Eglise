<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Check, Loader2, X } from 'lucide-vue-next'
import api from '@/services/api'

type IntentionStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

interface MassIntention {
  id: string
  intention: string
  beneficiaryName: string | null
  requestedDate: string
  timeSlot: string | null
  amount: string | number | null
  currency: string
  status: IntentionStatus
  createdAt: string
  requester: { firstName: string; lastName: string; phone: string | null } | null
}

const loading = ref(true)
const error = ref('')
const data = ref<MassIntention[]>([])
const updatingId = ref<string | null>(null)

const statusLabels: Record<IntentionStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
}

const statusClass: Record<IntentionStatus, string> = {
  PENDING: 'bg-[#FFF7E8] text-[#8A5A00]',
  CONFIRMED: 'bg-[#EDF8F1] text-[#14713C]',
  CANCELLED: 'bg-[#FFF1F0] text-[#B3261E]',
  COMPLETED: 'bg-[#EEF3FA] text-[#14345E]',
}

const stats = computed(() => ({
  total: data.value.length,
  pending: data.value.filter(i => i.status === 'PENDING').length,
  confirmed: data.value.filter(i => i.status === 'CONFIRMED').length,
}))

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value))

const formatAmount = (amount: string | number | null, currency: string) => {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('fr-FR').format(Number(amount)) + (currency === 'XOF' ? ' FCFA' : ` ${currency}`)
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get<{ success: boolean; data: MassIntention[] }>('/administration/overview/intentions')
    data.value = response.data.data
  } catch {
    error.value = 'Impossible de charger les demandes de messe.'
  } finally {
    loading.value = false
  }
}

const updateStatus = async (item: MassIntention, status: IntentionStatus) => {
  updatingId.value = item.id
  error.value = ''
  try {
    await api.patch(`/administration/overview/intentions/${item.id}/status`, { status })
    item.status = status
  } catch {
    error.value = 'Impossible de mettre à jour le statut.'
  } finally {
    updatingId.value = null
  }
}

onMounted(load)
</script>

<template>
  <section class="space-y-6">
    <header class="border border-[#C2BAB0] bg-white p-6">
      <p class="eyebrow text-[#C25A34]">Vie paroissiale</p>
      <h1 class="page-title mt-2 text-3xl text-[#0B1F3A]">Intentions de messe</h1>
      <p class="mt-2 text-sm text-[#6B655D]">Réception et suivi des demandes de messe de la paroisse.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="border border-[#C2BAB0] bg-white p-5"><p class="text-xs uppercase text-[#6B655D]">Total</p><p class="mt-2 text-2xl font-semibold text-[#14345E]">{{ stats.total }}</p></div>
      <div class="border border-[#C2BAB0] bg-white p-5"><p class="text-xs uppercase text-[#6B655D]">En attente</p><p class="mt-2 text-2xl font-semibold text-[#8A5A00]">{{ stats.pending }}</p></div>
      <div class="border border-[#C2BAB0] bg-white p-5"><p class="text-xs uppercase text-[#6B655D]">Confirmées</p><p class="mt-2 text-2xl font-semibold text-[#14713C]">{{ stats.confirmed }}</p></div>
    </div>

    <div v-if="error" class="border border-[#B3261E]/30 bg-[#FFF5F4] p-4 text-sm text-[#B3261E]">{{ error }}</div>
    <div v-if="loading" class="border border-[#C2BAB0] bg-white p-6 text-sm text-[#6B655D]">Chargement...</div>

    <div v-else class="overflow-x-auto border border-[#C2BAB0] bg-white">
      <table class="min-w-[900px] w-full text-sm">
        <thead><tr class="border-b bg-[#F7F5F2] text-left">
          <th class="p-4">Date</th><th class="p-4">Intention</th><th class="p-4">Demandeur</th><th class="p-4">Montant</th><th class="p-4">Statut</th><th class="p-4">Actions</th>
        </tr></thead>
        <tbody>
          <tr v-for="item in data" :key="item.id" class="border-b last:border-0">
            <td class="p-4 whitespace-nowrap">{{ formatDate(item.requestedDate) }}<span v-if="item.timeSlot" class="block text-xs text-[#6B655D]">{{ item.timeSlot }}</span></td>
            <td class="p-4"><span class="font-medium">{{ item.intention }}</span><span v-if="item.beneficiaryName" class="block text-xs text-[#6B655D]">{{ item.beneficiaryName }}</span></td>
            <td class="p-4">{{ item.requester ? `${item.requester.firstName} ${item.requester.lastName}` : '—' }}<span v-if="item.requester?.phone" class="block text-xs text-[#6B655D]">{{ item.requester.phone }}</span></td>
            <td class="p-4 whitespace-nowrap">{{ formatAmount(item.amount, item.currency) }}</td>
            <td class="p-4"><span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusClass[item.status]">{{ statusLabels[item.status] }}</span></td>
            <td class="p-4">
              <div class="flex gap-2">
                <button v-if="item.status === 'PENDING'" class="inline-flex items-center gap-1 rounded bg-[#14713C] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" :disabled="updatingId === item.id" @click="updateStatus(item, 'CONFIRMED')"><Loader2 v-if="updatingId === item.id" class="size-3 animate-spin" /><Check v-else class="size-3" /> Confirmer</button>
                <button v-if="item.status === 'PENDING'" class="inline-flex items-center gap-1 rounded border border-[#B3261E]/30 px-3 py-2 text-xs font-semibold text-[#B3261E] disabled:opacity-50" :disabled="updatingId === item.id" @click="updateStatus(item, 'CANCELLED')"><X class="size-3" /> Annuler</button>
                <button v-if="item.status === 'CONFIRMED'" class="inline-flex items-center gap-1 rounded bg-[#14345E] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" :disabled="updatingId === item.id" @click="updateStatus(item, 'COMPLETED')">Marquer terminée</button>
              </div>
            </td>
          </tr>
          <tr v-if="!data.length"><td colspan="6" class="p-8 text-center text-sm text-[#6B655D]">Aucune demande de messe.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
