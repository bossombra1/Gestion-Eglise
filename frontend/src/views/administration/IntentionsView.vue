<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  CalendarDays,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Megaphone,
  Printer,
  Search,
  X,
  XCircle,
} from 'lucide-vue-next'
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
const selectedIds = ref<string[]>([])
const search = ref('')
const statusFilter = ref<'ALL' | IntentionStatus>('PENDING')
const typeFilter = ref('ALL')
const dateFilter = ref('ALL')
const page = ref(1)
const pageSize = ref(4)
const confirmOpen = ref(false)
const cashOpen = ref(false)
const cashSaving = ref(false)
const cashError = ref('')
const cashIntentionId = ref('')
const cashAmount = ref('')
const cashReference = ref('')
const cashNote = ref('')
const confirmMode = ref<'CONFIRM' | 'CANCEL'>('CONFIRM')
const pendingActionIds = ref<string[]>([])

const statusLabels: Record<IntentionStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Validé',
  CANCELLED: 'Refusé',
  COMPLETED: 'Verrouillé',
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return data.value.filter((item) => {
    const requester = item.requester ? `${item.requester.firstName} ${item.requester.lastName}` : ''
    const matchesSearch = !q || [
      requester,
      item.intention,
      item.beneficiaryName ?? '',
      item.requester?.phone ?? '',
      item.id,
    ].join(' ').toLowerCase().includes(q)

    const matchesStatus = statusFilter.value === 'ALL' || item.status === statusFilter.value
    const matchesType = typeFilter.value === 'ALL' || item.intention === typeFilter.value

    const d = new Date(item.requestedDate)
    const now = new Date()
    const matchesDate =
      dateFilter.value === 'ALL' ||
      (dateFilter.value === 'UPCOMING' && d >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) ||
      (dateFilter.value === 'TODAY' && d.toDateString() === now.toDateString())

    return matchesSearch && matchesStatus && matchesType && matchesDate
  })
})

const types = computed(() => [...new Set(data.value.map(item => item.intention).filter(Boolean))])

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const pendingCount = computed(() => data.value.filter(i => i.status === 'PENDING').length)
const validatedThisMonth = computed(() => {
  const now = new Date()
  return data.value.filter(i => {
    const d = new Date(i.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && ['CONFIRMED', 'COMPLETED'].includes(i.status)
  }).length
})

const cashCandidates = computed(() => data.value.filter(i => i.status === 'PENDING' && Number(i.amount ?? 0) > 0))
const cashIntention = computed(() => data.value.find(i => i.id === cashIntentionId.value) ?? null)

const selectedPending = computed(() =>
  data.value.filter(i => selectedIds.value.includes(i.id) && i.status === 'PENDING')
)

const selectedTotal = computed(() =>
  selectedPending.value.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
)

const allVisibleSelected = computed(() =>
  paginated.value.length > 0 && paginated.value.every(item => selectedIds.value.includes(item.id))
)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(new Date(value))

const formatTime = (value: string | null) => value || '—'

const formatAmount = (amount: string | number | null, currency: string) => {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('fr-FR').format(Number(amount)) + (currency === 'XOF' ? ' FCFA' : ` ${currency}`)
}

const requesterName = (item: MassIntention) =>
  item.requester ? `${item.requester.firstName} ${item.requester.lastName}` : 'Demandeur non renseigné'

const resetFilters = () => {
  search.value = ''
  statusFilter.value = 'PENDING'
  typeFilter.value = 'ALL'
  dateFilter.value = 'ALL'
  page.value = 1
}

const toggleSelection = (id: string) => {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter(value => value !== id)
    : [...selectedIds.value, id]
}

const toggleAllVisible = () => {
  if (allVisibleSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !paginated.value.some(item => item.id === id))
  } else {
    selectedIds.value = [...new Set([...selectedIds.value, ...paginated.value.filter(i => i.status === 'PENDING').map(i => i.id)])]
  }
}

const openCashModal = () => {
  cashError.value = ''
  cashIntentionId.value = ''
  cashAmount.value = ''
  cashReference.value = ''
  cashNote.value = ''
  cashOpen.value = true
}

const selectCashIntention = (item: MassIntention) => {
  cashIntentionId.value = item.id
  cashAmount.value = item.amount == null ? '' : String(item.amount)
}

const saveCashReceipt = async () => {
  const item = cashIntention.value
  const amount = Number(cashAmount.value)
  if (!item) {
    cashError.value = 'Sélectionnez une intention en attente.'
    return
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    cashError.value = 'Renseignez un montant encaissé valide.'
    return
  }

  cashSaving.value = true
  cashError.value = ''
  try {
    await api.post('/administration/overview/intentions/' + item.id + '/cash', {
      amount,
      reference: cashReference.value.trim() || undefined,
      note: cashNote.value.trim() || undefined,
    })
    item.status = 'CONFIRMED'
    cashOpen.value = false
    cashIntentionId.value = ''
  } catch (e: any) {
    cashError.value = e?.response?.data?.message || 'Impossible d’enregistrer l’encaissement.'
  } finally {
    cashSaving.value = false
  }
}

const openBulkConfirm = (mode: 'CONFIRM' | 'CANCEL') => {
  if (!selectedPending.value.length) return
  confirmMode.value = mode
  pendingActionIds.value = selectedPending.value.map(i => i.id)
  confirmOpen.value = true
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

const confirmBulkAction = async () => {
  const status: IntentionStatus = confirmMode.value === 'CONFIRM' ? 'CONFIRMED' : 'CANCELLED'
  error.value = ''
  try {
    await Promise.all(
      pendingActionIds.value.map(id =>
        api.patch(`/administration/overview/intentions/${id}/status`, { status })
      )
    )
    data.value.forEach(item => {
      if (pendingActionIds.value.includes(item.id)) item.status = status
    })
    selectedIds.value = selectedIds.value.filter(id => !pendingActionIds.value.includes(id))
    confirmOpen.value = false
  } catch {
    error.value = 'Certaines intentions n’ont pas pu être mises à jour.'
  }
}

const printSheet = () => {
  window.print()
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

onMounted(load)
</script>

<template>
  <section class="min-w-0">
    <div class="mb-0 border border-[#C2BAB0] bg-white">
      <div class="flex flex-col gap-4 border-b border-[#DDD7CF] px-5 py-4 lg:flex-row lg:items-center">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <Megaphone class="size-5 text-[#14345E]" />
            <h1 class="font-sans text-xl font-bold text-[#2E2925]">Intentions de messe</h1>
          </div>
          <p class="mt-1 text-[13.5px] text-[#6B655D]">
            {{ pendingCount }} en attente · {{ validatedThisMonth }} validées ce mois
          </p>
        </div>

        <div class="flex flex-wrap gap-2 lg:ml-auto">
          <button
            type="button"
            title="Enregistrer un encaissement réel lié à une intention en attente."
            class="inline-flex min-h-10 items-center gap-2 rounded border-[1.5px] border-[#14345E] bg-white px-3 text-sm font-semibold text-[#14345E] hover:bg-[#F7F5F2]"
            @click="openCashModal"
          >
            <Banknote class="size-4" />
            Encaisser des espèces
          </button>
          <button
            type="button"
            class="inline-flex min-h-10 items-center gap-2 rounded bg-[#14345E] px-3.5 text-sm font-bold text-white hover:bg-[#0E2A4E]"
            @click="printSheet"
          >
            <Printer class="size-4" />
            Générer la feuille du jour
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 border-b border-[#EDE9E4] bg-white px-4 py-2.5">
        <label class="flex min-h-12 w-full max-w-[360px] items-center gap-2 rounded border-[1.5px] border-[#C2BAB0] bg-white px-3">
          <Search class="size-4 text-[#6B655D]" />
          <input v-model="search" class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9A9289]" placeholder="Rechercher un nom, un reçu…" />
        </label>

        <label class="flex min-h-12 items-center gap-2 rounded border-[1.5px] border-[#C2BAB0] bg-white px-3 text-sm text-[#2E2925]">
          <CalendarDays class="size-4 text-[#14345E]" />
          <select v-model="dateFilter" class="bg-transparent outline-none">
            <option value="ALL">Toutes les dates</option>
            <option value="TODAY">Aujourd’hui</option>
            <option value="UPCOMING">À venir</option>
          </select>
          <ChevronDown class="size-3.5 text-[#6B655D]" />
        </label>

        <label class="flex h-9 items-center gap-2 rounded border-[1.5px] border-[#C2BAB0] bg-white px-3 text-sm text-[#2E2925]">
          <select v-model="statusFilter" class="bg-transparent outline-none">
            <option value="PENDING">Statut : en attente</option>
            <option value="ALL">Tous les statuts</option>
            <option value="CONFIRMED">Validé</option>
            <option value="COMPLETED">Verrouillé</option>
            <option value="CANCELLED">Refusé</option>
          </select>
          <ChevronDown class="size-3.5 text-[#6B655D]" />
        </label>

        <label class="flex h-9 items-center gap-2 rounded border-[1.5px] border-[#C2BAB0] bg-white px-3 text-sm text-[#2E2925]">
          <select v-model="typeFilter" class="bg-transparent outline-none">
            <option value="ALL">Tous les types</option>
            <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
          </select>
          <ChevronDown class="size-3.5 text-[#6B655D]" />
        </label>

        <button type="button" class="ml-auto text-[13.5px] font-semibold text-[#A84A28] hover:underline" @click="resetFilters">
          Réinitialiser les filtres
        </button>
      </div>

      <div v-if="selectedPending.length" class="flex flex-col gap-3 bg-[#14345E] px-5 py-2.5 text-white lg:flex-row lg:items-center">
        <div class="flex items-center gap-3">
          <CheckCircle2 class="size-5" />
          <div class="text-sm font-bold">{{ selectedPending.length }} intentions sélectionnées</div>
          <div class="text-[13.5px] text-[#C3D0E1]">Total {{ formatAmount(selectedTotal, 'XOF') }} · à traiter</div>
        </div>
        <div class="flex flex-wrap gap-2 lg:ml-auto">
          <button type="button" class="min-h-9 rounded bg-white/10 px-3 text-[13.5px] font-semibold hover:bg-white/20" @click="openBulkConfirm('CANCEL')">
            <XCircle class="mr-1 inline size-4" /> Refuser
          </button>
          <button type="button" class="min-h-9 rounded bg-[#14713C] px-3 font-bold text-[13.5px] hover:bg-[#0F5A2F]" @click="openBulkConfirm('CONFIRM')">
            <Check class="mr-1 inline size-4" /> Valider les {{ selectedPending.length }}
          </button>
        </div>
      </div>

      <div v-if="error" class="m-4 rounded border border-[#B3261E]/30 bg-[#FFF5F4] p-3 text-sm text-[#B3261E]">{{ error }}</div>

      <div v-if="loading" class="p-10 text-center text-sm text-[#6B655D]">Chargement des intentions…</div>

      <div v-else class="responsive-table print-sheet">
        <div class="print-sheet-title">
          <h2>Feuille des intentions de messe</h2>
          <p>{{ new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()) }}</p>
        </div>

        <table class="min-w-[1080px] w-full border-collapse font-sans text-sm">
          <thead class="bg-white text-left">
            <tr class="border-b border-[#EDE9E4] text-[12px] uppercase tracking-wide text-[#6B655D]">
              <th class="w-10 px-3 py-3">
                <input type="checkbox" :checked="allVisibleSelected" class="size-4 accent-[#14345E]" @change="toggleAllVisible" />
              </th>
              <th class="w-24 px-3 py-3">Reçu</th>
              <th class="px-3 py-3">Demandeur</th>
              <th class="px-3 py-3">Type</th>
              <th class="px-3 py-3">Bénéficiaire</th>
              <th class="w-40 px-3 py-3">Messe</th>
              <th class="w-28 px-3 py-3">Montant</th>
              <th class="w-32 px-3 py-3">Paiement</th>
              <th class="w-32 px-3 py-3">Statut</th>
              <th class="w-24 px-3 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in paginated"
              :key="item.id"
              class="min-h-[76px] border-b border-[#EDE9E4] transition hover:bg-[#F7F5F2]"
              :class="selectedIds.includes(item.id) ? 'bg-[#E8EDF5]' : ''"
            >
              <td class="px-3 py-3">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(item.id)"
                  :disabled="item.status !== 'PENDING'"
                  class="size-4 accent-[#14345E] disabled:opacity-30"
                  @change="toggleSelection(item.id)"
                />
              </td>
              <td class="px-3 py-3 font-mono text-[12px] tabular-nums text-[#4A443E]">{{ item.id.slice(0, 8).toUpperCase() }}</td>
              <td class="px-3 py-3 font-semibold text-[#2E2925]">{{ requesterName(item) }}</td>
              <td class="px-3 py-3 text-[#4A443E]">{{ item.intention }}</td>
              <td class="px-3 py-3 text-[#4A443E]">{{ item.beneficiaryName || '—' }}</td>
              <td class="px-3 py-3 tabular-nums text-[#2E2925]">
                <span>{{ formatDate(item.requestedDate) }}</span>
                <span class="block text-xs text-[#6B655D]">{{ formatTime(item.timeSlot) }}</span>
              </td>
              <td class="px-3 py-3 whitespace-nowrap font-semibold tabular-nums text-[#2E2925]">{{ formatAmount(item.amount, item.currency) }}</td>
              <td class="px-3 py-3 text-[#4A443E]">—</td>
              <td class="px-3 py-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold"
                  :class="{
                    'border-[#14713C] bg-[#E4F1E8] text-[#14713C]': item.status === 'CONFIRMED',
                    'border-dashed border-[#8A5200] bg-[#FDF3DC] text-[#8A5200]': item.status === 'PENDING',
                    'border-[#B3261E] bg-[#FBE9E8] text-[#B3261E]': item.status === 'CANCELLED',
                    'border-[#14345E] bg-[#E8EDF5] text-[#14345E]': item.status === 'COMPLETED',
                  }"
                >
                  <CheckCircle2 v-if="item.status === 'CONFIRMED'" class="size-3.5" />
                  <Clock3 v-else-if="item.status === 'PENDING'" class="size-3.5" />
                  <XCircle v-else-if="item.status === 'CANCELLED'" class="size-3.5" />
                  <Check v-else class="size-3.5" />
                  {{ statusLabels[item.status] }}
                </span>
              </td>
              <td class="px-3 py-3">
                <button
                  v-if="item.status === 'PENDING'"
                  type="button"
                  class="font-semibold text-[#A84A28] hover:underline disabled:opacity-50"
                  :disabled="updatingId === item.id"
                  @click="pendingActionIds = [item.id]; confirmMode = 'CONFIRM'; confirmOpen = true"
                >
                  <Loader2 v-if="updatingId === item.id" class="inline size-3 animate-spin" />
                  Ouvrir
                </button>
                <span v-else-if="item.status === 'CANCELLED'" class="font-semibold text-[#A84A28]">Motif</span>
                <span v-else class="text-[13px] text-[#9A9289]">Verrouillé</span>
              </td>
            </tr>

            <tr v-if="!paginated.length">
              <td colspan="10" class="px-6 py-12 text-center text-sm text-[#6B655D]">Aucune intention ne correspond aux filtres.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-3 border-t border-[#EDE9E4] bg-white px-4 py-3 text-[13.5px] text-[#4A443E] sm:flex-row sm:items-center">
        <div>Lignes {{ filtered.length ? (page - 1) * pageSize + 1 : 0 }} à {{ Math.min(page * pageSize, filtered.length) }} sur {{ filtered.length }}</div>
        <div class="flex items-center gap-2">
          Afficher
          <select v-model.number="pageSize" class="h-8 rounded border-[1.5px] border-[#C2BAB0] bg-white px-2 outline-none">
            <option :value="9">9</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
          par page
        </div>
        <div class="flex items-center gap-1 sm:ml-auto">
          <button type="button" class="grid size-8 place-items-center rounded border border-[#DDD7CF] disabled:opacity-40" :disabled="page === 1" @click="page--">
            <ChevronLeft class="size-4" />
          </button>
          <span class="grid size-8 place-items-center rounded border-2 border-[#14345E] bg-[#14345E] text-white">{{ page }}</span>
          <button type="button" class="grid size-8 place-items-center rounded border border-[#DDD7CF] disabled:opacity-40" :disabled="page >= totalPages" @click="page++">
            <ChevronRight class="size-4" />
          </button>
        </div>
      </div>
    </div>

    <p class="mt-3 max-w-3xl text-[13.5px] leading-6 text-[#6B655D]">
      Une intention validée devient verrouillée : elle reste consultable mais n’offre plus d’action opérationnelle.
    </p>
  </section>

  <div v-if="cashOpen" class="fixed inset-0 z-[100] grid place-items-center bg-[#0B1F3A]/45 p-4" @click.self="cashOpen = false">
    <div class="w-full max-w-2xl overflow-hidden rounded border border-[#C2BAB0] bg-white shadow-2xl">
      <div class="flex items-start gap-3 border-b border-[#EDE9E4] p-5">
        <div class="grid size-10 shrink-0 place-items-center rounded bg-[#F7F5F2]">
          <Banknote class="size-6 text-[#4A443E]" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-[#2E2925]">Encaissement d'espèces au guichet</h2>
          <p class="mt-1 text-sm leading-5 text-[#6B655D]">Sélectionnez une intention réelle en attente puis enregistrez le montant effectivement reçu au guichet.</p>
        </div>
      </div>

      <div class="space-y-4 p-5">
        <div v-if="cashError" class="rounded border border-[#B3261E]/30 bg-[#FFF5F4] p-3 text-sm text-[#B3261E]">{{ cashError }}</div>

        <div v-if="!cashCandidates.length" class="rounded border border-dashed border-[#C2BAB0] bg-[#F7F5F2] p-5 text-center text-sm text-[#6B655D]">
          Aucune intention avec montant n'est actuellement en attente de validation.
        </div>

        <div v-else class="space-y-2">
          <p class="text-xs font-bold uppercase tracking-wide text-[#6B655D]">Intentions en attente</p>
          <button
            v-for="item in cashCandidates"
            :key="item.id"
            type="button"
            class="flex w-full items-center justify-between gap-4 rounded border p-3 text-left transition"
            :class="cashIntentionId === item.id ? 'border-[#14345E] bg-[#E8EDF5]' : 'border-[#EDE9E4] bg-white hover:bg-[#F7F5F2]'"
            @click="selectCashIntention(item)"
          >
            <span class="min-w-0">
              <span class="block truncate font-semibold text-[#2E2925]">{{ requesterName(item) }}</span>
              <span class="block truncate text-[13px] text-[#6B655D]">{{ item.intention }} · {{ formatDate(item.requestedDate) }}</span>
            </span>
            <span class="shrink-0 font-bold tabular-nums text-[#2E2925]">{{ formatAmount(item.amount, item.currency) }}</span>
          </button>
        </div>

        <div v-if="cashIntention" class="grid gap-3 sm:grid-cols-2">
          <label class="block text-sm font-semibold text-[#2E2925]">
            Montant encaissé
            <input v-model="cashAmount" type="number" min="1" step="1" class="mt-1 h-11 w-full rounded border-[1.5px] border-[#C2BAB0] bg-white px-3 font-semibold outline-none focus:border-[#14345E]" />
          </label>
          <label class="block text-sm font-semibold text-[#2E2925]">
            Référence du bordereau
            <input v-model="cashReference" type="text" maxlength="150" placeholder="Optionnel" class="mt-1 h-11 w-full rounded border-[1.5px] border-[#C2BAB0] bg-white px-3 font-normal outline-none focus:border-[#14345E]" />
          </label>
          <label class="block text-sm font-semibold text-[#2E2925] sm:col-span-2">
            Note
            <textarea v-model="cashNote" rows="2" maxlength="500" placeholder="Observation sur l'encaissement, si nécessaire" class="mt-1 w-full rounded border-[1.5px] border-[#C2BAB0] bg-white px-3 py-2 font-normal outline-none focus:border-[#14345E]" />
          </label>
          <div class="flex gap-2 rounded bg-[#FDF3DC] p-3 text-sm text-[#8A5200] sm:col-span-2">
            <Banknote class="mt-0.5 size-4 shrink-0" />
            L'encaissement sera enregistré comme paiement espèces réel et l'intention sera validée dans la même opération.
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 border-t border-[#EDE9E4] px-5 py-4">
        <button type="button" class="min-h-10 rounded border-[1.5px] border-[#C2BAB0] bg-white px-4 text-sm font-semibold text-[#2E2925]" @click="cashOpen = false">Annuler</button>
        <button type="button" class="inline-flex min-h-10 items-center gap-2 rounded bg-[#14345E] px-4 text-sm font-bold text-white hover:bg-[#0E2A4E] disabled:opacity-50" :disabled="cashSaving || !cashIntention" @click="saveCashReceipt">
          <Loader2 v-if="cashSaving" class="size-4 animate-spin" />
          <Banknote v-else class="size-4" />
          Enregistrer l'encaissement
        </button>
      </div>
    </div>
  </div>

  <div v-if="confirmOpen" class="fixed inset-0 z-[100] grid place-items-center bg-[#0B1F3A]/45 p-4" @click.self="confirmOpen = false">
    <div class="w-full max-w-xl overflow-hidden rounded border border-[#C2BAB0] bg-white shadow-2xl">
      <div class="flex items-start gap-3 border-b border-[#EDE9E4] p-5">
        <div class="grid size-10 shrink-0 place-items-center rounded bg-[#E8EDF5]">
          <CheckCircle2 class="size-6 text-[#14345E]" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-[#2E2925]">
            {{ confirmMode === 'CONFIRM' ? `Valider ${pendingActionIds.length} intention${pendingActionIds.length > 1 ? 's' : ''} ?` : `Refuser ${pendingActionIds.length} intention${pendingActionIds.length > 1 ? 's' : ''} ?` }}
          </h2>
          <p class="mt-1 text-sm leading-5 text-[#4A443E]">
            {{ confirmMode === 'CONFIRM'
              ? 'Une fois validées, elles entrent dans la feuille du prêtre et ne peuvent plus être modifiées.'
              : 'Les intentions seront refusées et retirées de la file de validation.' }}
          </p>
        </div>
      </div>

      <div class="grid gap-2 p-5">
        <div v-for="id in pendingActionIds" :key="id" class="flex justify-between gap-4 rounded bg-[#F7F5F2] px-3 py-2.5 text-sm">
          <span class="text-[#4A443E]">{{ requesterName(data.find(item => item.id === id)!) }} · {{ data.find(item => item.id === id)?.intention }}</span>
          <span class="font-semibold text-[#2E2925]">{{ data.find(item => item.id === id) ? formatDate(data.find(item => item.id === id)!.requestedDate) : '' }}</span>
        </div>
        <div v-if="confirmMode === 'CONFIRM'" class="flex gap-2 rounded bg-[#E8EDF5] p-3 text-sm text-[#14345E]">
          <CheckCircle2 class="mt-0.5 size-4 shrink-0" />
          La validation est appliquée à toutes les intentions sélectionnées.
        </div>
      </div>

      <div class="flex justify-end gap-2 px-5 pb-5">
        <button type="button" class="min-h-10 rounded border-[1.5px] border-[#C2BAB0] bg-white px-4 text-sm font-semibold text-[#2E2925]" @click="confirmOpen = false">Annuler</button>
        <button
          type="button"
          class="inline-flex min-h-10 items-center gap-2 rounded px-4 text-sm font-bold text-white"
          :class="confirmMode === 'CONFIRM' ? 'bg-[#14713C] hover:bg-[#0F5A2F]' : 'bg-[#B3261E] hover:bg-[#8F1E18]'"
          @click="confirmBulkAction"
        >
          <Check class="size-4" />
          {{ confirmMode === 'CONFIRM' ? `Oui, valider les ${pendingActionIds.length}` : `Oui, refuser les ${pendingActionIds.length}` }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.print-sheet-title {
  display: none;
}

@media print {
  @page {
    size: A4 landscape;
    margin: 12mm;
  }

  :global(body) {
    background: white !important;
  }

  :global(body > *) {
    visibility: hidden !important;
  }

  :global(body > * *) {
    visibility: hidden !important;
  }

  :global(.print-sheet),
  :global(.print-sheet *) {
    visibility: visible !important;
  }

  :global(.print-sheet) {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: white !important;
  }

  .print-sheet-title {
    display: block;
    margin-bottom: 10mm;
    text-align: center;
  }

  .print-sheet-title h2 {
    margin: 0;
    font-size: 18pt;
    font-weight: 700;
    color: #000;
  }

  .print-sheet-title p {
    margin: 3mm 0 0;
    font-size: 10pt;
    color: #333;
    text-transform: capitalize;
  }

  .print-sheet table {
    width: 100% !important;
    min-width: 0 !important;
    border-collapse: collapse !important;
    font-size: 9pt !important;
  }

  .print-sheet th,
  .print-sheet td {
    border: 1px solid #777 !important;
    padding: 6px !important;
    color: #000 !important;
    background: white !important;
  }

  .print-sheet thead {
    display: table-header-group;
  }

  .print-sheet tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
