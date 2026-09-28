<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import { Eye, Pencil, Trash2, X } from 'lucide-vue-next'
import { mouvementService } from '@/services/mouvement.service'
import { useMouvementStore } from '@/stores/mouvement'
import type { MovementSummary, PaymentMethod } from '@/types/mouvement'

const store = useMouvementStore()
const movements = ref<MovementSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const feeForm = ref({ movementId: '', name: '', amount: '', dueDate: '' })
const paymentForm = ref({ registrationId: '', feeId: '', amount: '', method: 'CASH' as PaymentMethod, transactionReference: '' })
const savingFee = ref(false)
const savingPayment = ref(false)
const savingFeeEdit = ref(false)
const editingFeeId = ref<string | null>(null)
const editingFeeForm = ref({ name: '', amount: '', dueDate: '', active: true })
const success = ref<string | null>(null)

const filters = ref({
  movementId: '',
  feeId: '',
  status: 'ALL' as 'ALL' | 'PAID' | 'PARTIAL' | 'UNPAID',
  child: '',
  period: 'ALL' as 'ALL' | 'YEAR' | '30_DAYS',
})

const activeRegistrations = computed(() =>
  store.registrations.filter((item) => item.status === 'APPROVED' || item.status === 'COMPLETED'),
)

const successfulPayments = computed(() =>
  store.payments.filter((payment) => payment.status === 'SUCCESS'),
)

const selectedPaymentChildId = ref<string | null>(null)
const selectedFinancialChildId = ref<string | null>(null)

const paymentGroups = computed(() => {
  const groups = new Map<string, { childId: string; childName: string; movementNames: string[]; payments: typeof store.payments; total: number }>()
  for (const payment of store.payments) {
    const child = payment.registration?.child
    if (!child) continue
    const existing = groups.get(child.id)
    if (existing) {
      existing.payments.push(payment)
      existing.total += Number(payment.amount)
      const movementName = payment.registration?.movement.name
      if (movementName && !existing.movementNames.includes(movementName)) existing.movementNames.push(movementName)
    } else {
      groups.set(child.id, {
        childId: child.id,
        childName: `${child.firstName} ${child.lastName}`,
        movementNames: payment.registration?.movement.name ? [payment.registration.movement.name] : [],
        payments: [payment],
        total: Number(payment.amount),
      })
    }
  }
  return Array.from(groups.values()).sort((a, b) => a.childName.localeCompare(b.childName, 'fr'))
})

const selectedPaymentGroup = computed(() => paymentGroups.value.find((group) => group.childId === selectedPaymentChildId.value) ?? null)
const openPaymentDetails = (childId: string) => { selectedPaymentChildId.value = childId }
const closePaymentDetails = () => { selectedPaymentChildId.value = null }
const openFinancialDetails = (childId: string) => { selectedFinancialChildId.value = childId }
const closeFinancialDetails = () => { selectedFinancialChildId.value = null }

const financialGroups = computed(() => {
  const groups = new Map<string, { childId: string; childName: string; movementNames: string[]; rows: typeof filteredFeeRows.value; due: number; paid: number; remaining: number }>()
  for (const row of filteredFeeRows.value) {
    const existing = groups.get(row.childId)
    if (existing) {
      existing.rows.push(row); existing.due += row.due; existing.paid += row.paid; existing.remaining += row.remaining
      if (!existing.movementNames.includes(row.movementName)) existing.movementNames.push(row.movementName)
    } else {
      groups.set(row.childId, { childId: row.childId, childName: row.childName, movementNames: [row.movementName], rows: [row], due: row.due, paid: row.paid, remaining: row.remaining })
    }
  }
  return Array.from(groups.values()).sort((a, b) => a.childName.localeCompare(b.childName, 'fr'))
})

const selectedFinancialGroup = computed(() => financialGroups.value.find((group) => group.childId === selectedFinancialChildId.value) ?? null)

const activeFees = computed(() =>
  store.fees.filter((fee) => fee.active),
)

const feeRows = computed(() => {
  const rows: Array<{
    key: string
    registrationId: string
    childId: string
    childName: string
    movementId: string
    movementName: string
    feeId: string
    feeName: string
    due: number
    paid: number
    remaining: number
    status: 'PAID' | 'PARTIAL' | 'UNPAID'
  }> = []

  for (const registration of activeRegistrations.value) {
    for (const fee of activeFees.value.filter((item) => item.movementId === registration.movementId)) {
      const paid = successfulPayments.value
        .filter((payment) => payment.registration?.id === registration.id && payment.fee?.id === fee.id)
        .reduce((sum, payment) => sum + Number(payment.amount), 0)

      const due = Number(fee.amount)
      const remaining = Math.max(due - paid, 0)
      const status = paid >= due ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID'

      rows.push({
        key: `${registration.id}-${fee.id}`,
        registrationId: registration.id,
        childId: registration.child.id,
        childName: `${registration.child.firstName} ${registration.child.lastName}`,
        movementId: registration.movementId,
        movementName: registration.movement.name,
        feeId: fee.id,
        feeName: fee.name,
        due,
        paid,
        remaining,
        status,
      })
    }
  }

  return rows
})

const filteredFeeRows = computed(() => {
  const childQuery = filters.value.child.trim().toLowerCase()
  const now = Date.now()
  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  return feeRows.value.filter((row) => {
    if (filters.value.movementId && row.movementId !== filters.value.movementId) return false
    if (filters.value.feeId && row.feeId !== filters.value.feeId) return false
    if (filters.value.status !== 'ALL' && row.status !== filters.value.status) return false
    if (childQuery && !row.childName.toLowerCase().includes(childQuery)) return false

    if (filters.value.period !== 'ALL') {
      const fee = store.fees.find((item) => item.id === row.feeId)
      const date = fee?.dueDate ? new Date(fee.dueDate).getTime() : null
      if (filters.value.period === 'YEAR' && date !== null && date < yearStart) return false
      if (filters.value.period === '30_DAYS' && date !== null && date < thirtyDaysAgo) return false
    }

    return true
  })
})

const financialSummary = computed(() => {
  const due = filteredFeeRows.value.reduce((sum, row) => sum + row.due, 0)
  const paid = filteredFeeRows.value.reduce((sum, row) => sum + row.paid, 0)
  return {
    due,
    paid,
    remaining: Math.max(due - paid, 0),
  }
})

const statusLabel = (status: 'PAID' | 'PARTIAL' | 'UNPAID') =>
  status === 'PAID' ? 'Payé' : status === 'PARTIAL' ? 'Partiel' : 'À payer'

const statusTone = (status: 'PAID' | 'PARTIAL' | 'UNPAID') =>
  status === 'PAID' ? 'success' : status === 'PARTIAL' ? 'warning' : 'danger'

const formatAmount = (value: string | number) =>
  new Intl.NumberFormat('fr-FR').format(Number(value)) + ' FCFA'

const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value)) : '—'

const approvedRegistrations = computed(() =>
  store.registrations.filter((item) => item.status === 'APPROVED' || item.status === 'COMPLETED'),
)

const selectedRegistration = computed(() =>
  store.registrations.find((registration) => registration.id === paymentForm.value.registrationId),
)

const eligibleFees = computed(() => {
  const movementId = selectedRegistration.value?.movementId
  const registrationId = selectedRegistration.value?.id
  if (!movementId || !registrationId) return []
  return store.fees.filter((fee) => {
    if (fee.movementId !== movementId || !fee.active) return false
    const paid = successfulPayments.value.filter((payment) => payment.registration?.id === registrationId && payment.fee?.id === fee.id).reduce((sum, payment) => sum + Number(payment.amount), 0)
    return Number(fee.amount) - paid > 0
  })
})

const selectedFee = computed(() =>
  eligibleFees.value.find((fee) => fee.id === paymentForm.value.feeId),
)

const startEditFee = (fee: (typeof store.fees)[number]) => {
  editingFeeId.value = fee.id
  editingFeeForm.value = {
    name: fee.name,
    amount: String(fee.amount),
    dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().slice(0, 10) : '',
    active: fee.active,
  }
}

const cancelEditFee = () => {
  editingFeeId.value = null
  editingFeeForm.value = { name: '', amount: '', dueDate: '', active: true }
}

const submitFeeEdit = async () => {
  if (!editingFeeId.value) return
  error.value = null
  success.value = null
  savingFeeEdit.value = true
  try {
    await store.updateFee({
      id: editingFeeId.value,
      name: editingFeeForm.value.name,
      amount: Number(editingFeeForm.value.amount),
      dueDate: editingFeeForm.value.dueDate
        ? new Date(editingFeeForm.value.dueDate).toISOString()
        : undefined,
      active: editingFeeForm.value.active,
    })
    cancelEditFee()
    success.value = 'Cotisation modifiée avec succès.'
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Impossible de modifier la cotisation.'
  } finally {
    savingFeeEdit.value = false
  }
}

const removeFee = async (feeId: string) => {
  const fee = store.fees.find((item) => item.id === feeId)
  if (!fee) return
  if (!window.confirm(`Supprimer la cotisation « ${fee.name} » ?`)) return

  error.value = null
  success.value = null
  try {
    const result = await store.deleteFee(feeId)
    success.value = result?.message ?? 'Cotisation supprimée.'
    if (editingFeeId.value === feeId) cancelEditFee()
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Impossible de supprimer la cotisation.'
  }
}

const submitFee = async () => {
  error.value = null
  success.value = null
  savingFee.value = true
  try {
    await store.createFee({
      movementId: feeForm.value.movementId,
      name: feeForm.value.name,
      amount: Number(feeForm.value.amount),
      dueDate: feeForm.value.dueDate ? new Date(feeForm.value.dueDate).toISOString() : undefined,
    })
    feeForm.value = { movementId: feeForm.value.movementId, name: '', amount: '', dueDate: '' }
    success.value = 'Cotisation créée.'
  } catch {
    error.value = 'Impossible de créer la cotisation.'
  } finally {
    savingFee.value = false
  }
}

const submitPayment = async () => {
  error.value = null
  success.value = null
  savingPayment.value = true
  try {
    if (!selectedRegistration.value) {
      error.value = 'Sélectionnez une inscription approuvée.'
      return
    }
    if (paymentForm.value.feeId && !selectedFee.value) {
      error.value = 'Cette cotisation est déjà soldée ou ne correspond pas au mouvement de cette inscription.'
      return
    }
    if (selectedFee.value) {
      const paid = successfulPayments.value.filter((payment) => payment.registration?.id === paymentForm.value.registrationId && payment.fee?.id === selectedFee.value?.id).reduce((sum, payment) => sum + Number(payment.amount), 0)
      const remaining = Math.max(Number(selectedFee.value.amount) - paid, 0)
      if (Number(paymentForm.value.amount) > remaining) {
        error.value = `Le montant maximum restant pour cette cotisation est de ${formatAmount(remaining)}.`
        return
      }
    }

    await store.createPayment({
      registrationId: paymentForm.value.registrationId,
      feeId: paymentForm.value.feeId || undefined,
      amount: Number(paymentForm.value.amount),
      method: paymentForm.value.method,
      transactionReference: paymentForm.value.transactionReference || undefined,
    })
    paymentForm.value = { registrationId: '', feeId: '', amount: '', method: 'CASH', transactionReference: '' }
    success.value = 'Paiement enregistré avec succès.'
  } catch (err: any) {
    error.value =
      err?.response?.data?.message ??
      (Array.isArray(err?.response?.data?.errors)
        ? err.response.data.errors.join(', ')
        : 'Impossible d’enregistrer le paiement.')
  } finally {
    savingPayment.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const movementResponse = await mouvementService.getMovement()
    const raw = movementResponse.data ?? movementResponse
    movements.value = Array.isArray(raw) ? raw : [raw]
    if (!feeForm.value.movementId && movements.value[0]) feeForm.value.movementId = movements.value[0].id
    await Promise.all([store.loadRegistrations(), store.loadFees(), store.loadPayments()])
  } catch {
    error.value = 'Impossible de charger les cotisations et paiements.'
  } finally {
    loading.value = false
  }
})
</script><template>
  <section>
    <div class="border-b border-[#C2BAB0] pb-5">
      <p class="eyebrow text-[#C25A34]">Responsable de mouvement</p>
      <h1 class="page-title mt-1 text-4xl text-[#0B1F3A]">Cotisations & paiements</h1>
      <p class="mt-2 text-[#6B655D]">Définissez les cotisations, suivez les montants dus et enregistrez les paiements des membres inscrits.</p>
    </div>

    <div v-if="loading" class="mt-8 flex justify-center py-12"><AppSpinner /></div>
    <div v-else>
      <div v-if="error" class="mt-6 border border-[#B3261E] bg-[#FCE5E3] p-4 text-sm text-[#8F1E18]">{{ error }}</div>
      <div v-if="success" class="mt-6 border border-[#14713C] bg-[#E4F2E9] p-4 text-sm text-[#14713C]">{{ success }}</div>

      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <article class="border border-[#C2BAB0] bg-white p-5">
          <p class="text-sm font-semibold text-[#6B655D]">À recevoir</p>
          <p class="mt-2 text-2xl font-bold text-[#0B1F3A]">{{ formatAmount(financialSummary.due) }}</p>
          <p class="mt-1 text-xs text-[#6B655D]">Selon les inscriptions et cotisations affichées</p>
        </article>
        <article class="border border-[#C2BAB0] bg-white p-5">
          <p class="text-sm font-semibold text-[#6B655D]">Reçu</p>
          <p class="mt-2 text-2xl font-bold text-[#14713C]">{{ formatAmount(financialSummary.paid) }}</p>
          <p class="mt-1 text-xs text-[#6B655D]">Paiements affectés aux cotisations</p>
        </article>
        <article class="border border-[#C2BAB0] bg-white p-5">
          <p class="text-sm font-semibold text-[#6B655D]">Reste à recevoir</p>
          <p class="mt-2 text-2xl font-bold text-[#C25A34]">{{ formatAmount(financialSummary.remaining) }}</p>
          <p class="mt-1 text-xs text-[#6B655D]">Montant encore dû</p>
        </article>
      </div>


      <div class="mt-6 grid gap-6 xl:grid-cols-2">
        <article class="border border-[#C2BAB0] bg-white p-6">
          <p class="eyebrow text-[#6B655D]">Nouvelle cotisation</p>
          <h2 class="page-title mt-1 text-2xl text-[#14345E]">Créer un montant à payer</h2>
          <form class="mt-5 space-y-4" @submit.prevent="submitFee">
            <label class="block text-sm font-semibold">Mouvement
              <select v-model="feeForm.movementId" required class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal">
                <option value="" disabled>Sélectionner</option>
                <option v-for="movement in movements" :key="movement.id" :value="movement.id">{{ movement.name }}</option>
              </select>
            </label>
            <label class="block text-sm font-semibold">Libellé
              <input v-model="feeForm.name" required minlength="2" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" placeholder="Cotisation annuelle" />
            </label>
            <label class="block text-sm font-semibold">Montant (FCFA)
              <input v-model="feeForm.amount" required min="1" type="number" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" placeholder="5000" />
            </label>
            <label class="block text-sm font-semibold">Échéance
              <input v-model="feeForm.dueDate" type="date" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" />
            </label>
            <AppButton type="submit" :disabled="savingFee">{{ savingFee ? 'Création...' : 'Créer la cotisation' }}</AppButton>
          </form>
        </article>

        <article class="border border-[#C2BAB0] bg-white p-6">
          <p class="eyebrow text-[#6B655D]">Enregistrer un paiement</p>
          <h2 class="page-title mt-1 text-2xl text-[#14345E]">Paiement reçu</h2>
          <form class="mt-5 space-y-4" @submit.prevent="submitPayment">
            <label class="block text-sm font-semibold">Enfant / inscription
              <select v-model="paymentForm.registrationId" required class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal">
                <option value="" disabled>Sélectionner</option>
                <option v-for="registration in approvedRegistrations" :key="registration.id" :value="registration.id">
                  {{ registration.child.firstName }} {{ registration.child.lastName }} — {{ registration.movement.name }}
                </option>
              </select>
            </label>
            <label class="block text-sm font-semibold">Cotisation
              <select v-model="paymentForm.feeId" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" :disabled="!selectedRegistration">
                <option value="">Aucune / paiement libre</option>
                <option v-for="fee in eligibleFees" :key="fee.id" :value="fee.id">
                  {{ fee.name }} — {{ formatAmount(fee.amount) }}
                </option>
              </select>
              <span v-if="!selectedRegistration" class="mt-1 block text-xs font-normal text-[#6B655D]">Sélectionnez d’abord une inscription.</span>
              <span v-else-if="!eligibleFees.length" class="mt-1 block text-xs font-normal text-[#6B655D]">Aucune cotisation active pour ce mouvement.</span>
            </label>
            <p v-if="selectedFee" class="text-xs text-[#6B655D]">Montant indicatif : {{ formatAmount(selectedFee.amount) }}</p>
            <label class="block text-sm font-semibold">Montant (FCFA)
              <input v-model="paymentForm.amount" required min="1" type="number" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" placeholder="5000" />
            </label>
            <label class="block text-sm font-semibold">Mode de paiement
              <select v-model="paymentForm.method" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal">
                <option value="CASH">Espèces</option>
                <option value="WAVE">Wave</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="MTN_MONEY">MTN Money</option>
                <option value="MOOV_MONEY">Moov Money</option>
                <option value="OTHER">Autre</option>
              </select>
            </label>
            <label class="block text-sm font-semibold">Référence de transaction
              <input v-model="paymentForm.transactionReference" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" placeholder="Optionnel pour les paiements manuels" />
            </label>
            <AppButton type="submit" :disabled="savingPayment">{{ savingPayment ? 'Enregistrement...' : 'Enregistrer le paiement' }}</AppButton>
          </form>
        </article>
      </div>

      <article class="mt-6 border border-[#C2BAB0] bg-white">
        <div class="border-b border-[#DDD7CF] p-5">
          <p class="eyebrow text-[#6B655D]">Gestion</p>
          <h2 class="page-title mt-1 text-2xl text-[#14345E]">Cotisations du mouvement</h2>
          <p class="mt-1 text-sm text-[#6B655D]">Modifiez les montants et échéances, ou désactivez une cotisation. Une cotisation ayant déjà reçu un paiement est conservée pour préserver l’historique.</p>
        </div>

        <div class="divide-y divide-[#EDE9E4]">
          <div v-if="!store.fees.length" class="p-6 text-sm text-[#6B655D]">Aucune cotisation créée.</div>
          <div v-for="fee in store.fees" :key="fee.id" class="p-5">
            <div v-if="editingFeeId === fee.id" class="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
              <label class="text-sm font-semibold">Libellé
                <input v-model="editingFeeForm.name" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" />
              </label>
              <label class="text-sm font-semibold">Montant
                <input v-model="editingFeeForm.amount" type="number" min="1" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" />
              </label>
              <label class="text-sm font-semibold">Échéance
                <input v-model="editingFeeForm.dueDate" type="date" class="mt-1 w-full border border-[#C2BAB0] p-3 font-normal" />
              </label>
              <div class="flex gap-2">
                <AppButton type="button" :disabled="savingFeeEdit" @click="submitFeeEdit">{{ savingFeeEdit ? '...' : 'Enregistrer' }}</AppButton>
                <AppButton type="button" variant="secondary" :disabled="savingFeeEdit" @click="cancelEditFee">Annuler</AppButton>
              </div>
              <label class="flex items-center gap-2 text-sm font-medium lg:col-span-4">
                <input v-model="editingFeeForm.active" type="checkbox" />
                Cotisation active
              </label>
            </div>

            <div v-else class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-semibold text-[#2E2925]">{{ fee.name }}</p>
                  <AppBadge :tone="fee.active ? 'success' : 'warning'">{{ fee.active ? 'Active' : 'Inactive' }}</AppBadge>
                </div>
                <p class="mt-1 text-sm text-[#6B655D]">{{ fee.movement.name }} · Échéance {{ formatDate(fee.dueDate) }}</p>
              </div>
              <div class="flex items-center gap-4">
                <p class="font-bold text-[#0B1F3A]">{{ formatAmount(fee.amount) }}</p>
                <div class="flex gap-2">
                  <AppButton type="button" variant="secondary" class="min-h-9 px-3" @click="startEditFee(fee)">
                    <Pencil class="mr-2 size-4" />Modifier
                  </AppButton>
                  <AppButton type="button" variant="secondary" class="min-h-9 px-3 text-[#B3261E]" @click="removeFee(fee.id)">
                    <Trash2 class="mr-2 size-4" />Supprimer
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="mt-6 overflow-hidden border border-[#C2BAB0] bg-white">
        <div class="border-b border-[#DDD7CF] p-5">
          <p class="eyebrow text-[#6B655D]">Historique</p>
          <h2 class="page-title mt-1 text-2xl text-[#14345E]">Paiements enregistrés</h2>
        </div>
        <div v-if="!store.payments.length" class="p-8 text-sm text-[#6B655D]">Aucun paiement enregistré.</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-[#F7F5F2]">
              <tr>
                <th class="px-5 py-4">Enfant</th>
                <th class="px-5 py-4">Mouvement</th>
                <th class="px-5 py-4">Paiements</th>
                <th class="px-5 py-4">Total</th>
                <th class="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="group in paymentGroups" :key="group.childId" class="border-t border-[#EDE9E4]">
                <td class="px-5 py-4 font-semibold text-[#2E2925]">{{ group.childName }}</td>
                <td class="px-5 py-4">{{ group.movementNames.join(', ') || '—' }}</td>
                <td class="px-5 py-4 font-medium">{{ group.payments.length }}</td>
                <td class="px-5 py-4 font-semibold text-[#14713C]">{{ formatAmount(group.total) }}</td>
                <td class="px-5 py-4 text-right">
                  <AppButton type="button" variant="secondary" class="min-h-9 px-3" @click="openPaymentDetails(group.childId)">
                    <Eye class="mr-2 size-4" />
                    Voir
                  </AppButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>


      <article class="mt-6 border border-[#C2BAB0] bg-white p-5">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="eyebrow text-[#6B655D]">Suivi financier</p>
            <h2 class="page-title mt-1 text-2xl text-[#14345E]">Suivi financier par enfant</h2>
          </div>
          <p class="text-xs text-[#6B655D]">{{ filteredFeeRows.length }} ligne(s) affichée(s)</p>
        </div>

        <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select v-model="filters.movementId" class="w-full border border-[#C2BAB0] p-3 text-sm">
            <option value="">Tous les mouvements</option>
            <option v-for="movement in movements" :key="movement.id" :value="movement.id">{{ movement.name }}</option>
          </select>
          <select v-model="filters.feeId" class="w-full border border-[#C2BAB0] p-3 text-sm">
            <option value="">Toutes les cotisations</option>
            <option v-for="fee in activeFees" :key="fee.id" :value="fee.id">{{ fee.name }}</option>
          </select>
          <select v-model="filters.status" class="w-full border border-[#C2BAB0] p-3 text-sm">
            <option value="ALL">Tous les statuts</option>
            <option value="PAID">Payé</option>
            <option value="PARTIAL">Paiement partiel</option>
            <option value="UNPAID">À payer</option>
          </select>
          <input v-model="filters.child" type="search" class="w-full border border-[#C2BAB0] p-3 text-sm" placeholder="Rechercher un enfant" />
          <select v-model="filters.period" class="w-full border border-[#C2BAB0] p-3 text-sm">
            <option value="ALL">Toutes les périodes</option>
            <option value="YEAR">Cette année</option>
            <option value="30_DAYS">30 derniers jours</option>
          </select>
        </div>

        <div v-if="!financialGroups.length" class="mt-5 border border-dashed border-[#C2BAB0] p-8 text-center text-sm text-[#6B655D]">Aucune cotisation ne correspond aux filtres sélectionnés.</div>
        <div v-else class="mt-5 overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-[#F7F5F2]"><tr><th class="px-4 py-3">Enfant</th><th class="px-4 py-3">Mouvement</th><th class="px-4 py-3">Dû</th><th class="px-4 py-3">Payé</th><th class="px-4 py-3">Reste</th><th class="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              <tr v-for="group in financialGroups" :key="group.childId" class="border-t border-[#EDE9E4]">
                <td class="px-4 py-3 font-semibold">{{ group.childName }}</td>
                <td class="px-4 py-3">{{ group.movementNames.join(', ') }}</td>
                <td class="px-4 py-3">{{ formatAmount(group.due) }}</td>
                <td class="px-4 py-3 font-semibold text-[#14713C]">{{ formatAmount(group.paid) }}</td>
                <td class="px-4 py-3 font-semibold" :class="group.remaining ? 'text-[#C25A34]' : 'text-[#14713C]'">{{ formatAmount(group.remaining) }}</td>
                <td class="px-4 py-3 text-right"><AppButton type="button" variant="secondary" class="min-h-9 px-3" @click="openFinancialDetails(group.childId)"><Eye class="mr-2 size-4" />Voir</AppButton></td>
              </tr>
            </tbody>
          </table>
        </div>      </article>
      <div v-if="selectedPaymentGroup" class="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F3A]/50 p-4" @click.self="closePaymentDetails">
        <article class="max-h-[90vh] w-full max-w-3xl overflow-hidden border border-[#C2BAB0] bg-white shadow-xl">
          <header class="flex items-start justify-between gap-4 border-b border-[#DDD7CF] p-5">
            <div>
              <p class="eyebrow text-[#C25A34]">Détail des paiements</p>
              <h2 class="page-title mt-1 text-2xl text-[#14345E]">{{ selectedPaymentGroup.childName }}</h2>
              <p class="mt-1 text-sm text-[#6B655D]">{{ selectedPaymentGroup.payments.length }} paiement(s) · Total {{ formatAmount(selectedPaymentGroup.total) }}</p>
            </div>
            <button type="button" aria-label="Fermer" class="inline-flex size-10 shrink-0 items-center justify-center border border-[#C2BAB0] text-[#6B655D] hover:bg-[#F7F5F2]" @click="closePaymentDetails">
              <X class="size-5" />
            </button>
          </header>
          <div class="max-h-[65vh] overflow-y-auto p-5">
            <div class="space-y-3">
              <div v-for="payment in selectedPaymentGroup.payments" :key="payment.id" class="border border-[#EDE9E4] bg-[#F7F5F2] p-4">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p class="font-semibold text-[#2E2925]">{{ payment.fee?.name || 'Paiement libre' }}</p>
                    <p class="mt-1 text-xs text-[#6B655D]">{{ payment.registration?.movement.name || 'Mouvement non renseigné' }}</p>
                  </div>
                  <AppBadge :tone="payment.status === 'SUCCESS' ? 'success' : 'warning'">{{ payment.status === 'SUCCESS' ? 'Réussi' : payment.status }}</AppBadge>
                </div>
                <div class="mt-4 grid gap-3 sm:grid-cols-3">
                  <div><p class="text-xs uppercase tracking-wide text-[#6B655D]">Montant</p><p class="mt-1 font-semibold text-[#14713C]">{{ formatAmount(payment.amount) }}</p></div>
                  <div><p class="text-xs uppercase tracking-wide text-[#6B655D]">Mode</p><p class="mt-1 font-medium text-[#2E2925]">{{ payment.method }}</p></div>
                  <div><p class="text-xs uppercase tracking-wide text-[#6B655D]">Date</p><p class="mt-1 font-medium text-[#2E2925]">{{ formatDate(payment.paidAt) }}</p></div>
                </div>
                <p v-if="payment.transactionReference" class="mt-3 text-xs text-[#6B655D]">Référence : <span class="font-medium text-[#2E2925]">{{ payment.transactionReference }}</span></p>
              </div>
            </div>
          </div>
          <footer class="flex justify-end border-t border-[#DDD7CF] p-4">
            <AppButton type="button" variant="secondary" @click="closePaymentDetails">Fermer</AppButton>
          </footer>
        </article>
      </div>
      <div v-if="selectedFinancialGroup" class="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F3A]/50 p-4" @click.self="closeFinancialDetails">
        <article class="max-h-[90vh] w-full max-w-3xl overflow-hidden border border-[#C2BAB0] bg-white shadow-xl">
          <header class="flex items-start justify-between gap-4 border-b border-[#DDD7CF] p-5"><div><p class="eyebrow text-[#C25A34]">Détail financier</p><h2 class="page-title mt-1 text-2xl text-[#14345E]">{{ selectedFinancialGroup.childName }}</h2><p class="mt-1 text-sm text-[#6B655D]">Dû {{ formatAmount(selectedFinancialGroup.due) }} · Payé {{ formatAmount(selectedFinancialGroup.paid) }} · Reste {{ formatAmount(selectedFinancialGroup.remaining) }}</p></div><button type="button" aria-label="Fermer" class="inline-flex size-10 items-center justify-center border border-[#C2BAB0]" @click="closeFinancialDetails"><X class="size-5" /></button></header>
          <div class="max-h-[65vh] overflow-y-auto p-5 space-y-3">
            <div v-for="row in selectedFinancialGroup.rows" :key="row.key" class="border border-[#EDE9E4] bg-[#F7F5F2] p-4">
              <div class="flex items-start justify-between gap-3"><div><p class="font-semibold">{{ row.feeName }}</p><p class="mt-1 text-xs text-[#6B655D]">{{ row.movementName }}</p></div><AppBadge :tone="statusTone(row.status)">{{ statusLabel(row.status) }}</AppBadge></div>
              <div class="mt-4 grid gap-3 sm:grid-cols-3"><div><p class="text-xs uppercase text-[#6B655D]">Dû</p><p class="mt-1 font-semibold">{{ formatAmount(row.due) }}</p></div><div><p class="text-xs uppercase text-[#6B655D]">Payé</p><p class="mt-1 font-semibold text-[#14713C]">{{ formatAmount(row.paid) }}</p></div><div><p class="text-xs uppercase text-[#6B655D]">Reste</p><p class="mt-1 font-semibold text-[#C25A34]">{{ formatAmount(row.remaining) }}</p></div></div>
            </div>
          </div>
          <footer class="flex justify-end border-t border-[#DDD7CF] p-4"><AppButton type="button" variant="secondary" @click="closeFinancialDetails">Fermer</AppButton></footer>
        </article>
      </div>
    </div>
  </section>
</template>