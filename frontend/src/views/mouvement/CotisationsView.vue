<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
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
const success = ref<string | null>(null)

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
  if (!movementId) return []
  return store.fees.filter((fee) => fee.movementId === movementId && fee.active)
})

const selectedFee = computed(() =>
  eligibleFees.value.find((fee) => fee.id === paymentForm.value.feeId),
)

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
      error.value = 'La cotisation sélectionnée ne correspond pas au mouvement de cette inscription.'
      return
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
  } catch {
    error.value = 'Impossible d’enregistrer le paiement.'
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
</script>

<template>
  <section>
    <div class="border-b border-[#C2BAB0] pb-5">
      <p class="eyebrow text-[#C25A34]">Responsable de mouvement</p>
      <h1 class="page-title mt-1 text-4xl text-[#0B1F3A]">Cotisations & paiements</h1>
      <p class="mt-2 text-[#6B655D]">Définissez les cotisations et enregistrez les paiements des membres inscrits.</p>
    </div>

    <div v-if="loading" class="mt-8 flex justify-center py-12"><AppSpinner /></div>
    <div v-else>
      <div v-if="error" class="mt-6 border border-[#B3261E] bg-[#FCE5E3] p-4 text-sm text-[#8F1E18]">{{ error }}</div>
      <div v-if="success" class="mt-6 border border-[#14713C] bg-[#E4F2E9] p-4 text-sm text-[#14713C]">{{ success }}</div>

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
                <th class="px-5 py-4">Enfant</th><th class="px-5 py-4">Cotisation</th><th class="px-5 py-4">Montant</th><th class="px-5 py-4">Mode</th><th class="px-5 py-4">Date</th><th class="px-5 py-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in store.payments" :key="payment.id" class="border-t border-[#EDE9E4]">
                <td class="px-5 py-4">{{ payment.registration?.child.firstName }} {{ payment.registration?.child.lastName }}</td>
                <td class="px-5 py-4">{{ payment.fee?.name || 'Paiement libre' }}</td>
                <td class="px-5 py-4 font-semibold">{{ formatAmount(payment.amount) }}</td>
                <td class="px-5 py-4">{{ payment.method }}</td>
                <td class="px-5 py-4">{{ formatDate(payment.paidAt) }}</td>
                <td class="px-5 py-4"><AppBadge :tone="payment.status === 'SUCCESS' ? 'success' : 'warning'">{{ payment.status === 'SUCCESS' ? 'Réussi' : payment.status }}</AppBadge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </section>
</template>
