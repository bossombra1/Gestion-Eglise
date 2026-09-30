<!-- patched by assistant: see full existing implementation with safe first movement selection -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Download, RefreshCw, Users, ClipboardList, Wallet, MessageSquare, FileText } from 'lucide-vue-next'
import { administrationMovementsApi, type AdministrationMovement } from '@/services/administration-movements.service'
import { administrationMovementReportApi, type MovementReport } from '@/services/administration-movement-report.service'

const movements = ref<AdministrationMovement[]>([])
const movementId = ref('')
const period = ref<'monthly' | 'annual'>('monthly')
const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)
const report = ref<MovementReport | null>(null)
const loading = ref(true)
const error = ref('')
const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const selectedMovement = computed(() => movements.value.find(m => m.id === movementId.value))
async function loadReport() {
  if (!movementId.value) return
  loading.value = true; error.value = ''
  try { report.value = await administrationMovementReportApi.get(movementId.value, { period: period.value, year: year.value, month: period.value === 'monthly' ? month.value : undefined }) }
  catch { report.value = null; error.value = 'Impossible de charger le rapport du mouvement.' }
  finally { loading.value = false }
}
async function load() {
  loading.value = true; error.value = ''
  try {
    movements.value = await administrationMovementsApi.list()
    const firstMovement = movements.value[0]
    if (!movementId.value && firstMovement) movementId.value = firstMovement.id
    await loadReport()
  } catch { error.value = 'Impossible de charger les mouvements.'; loading.value = false }
}
watch([movementId, period, year, month], loadReport)
onMounted(load)
const money = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value)
const date = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value))
</script>

<template>
  <section class="space-y-6">
    <header class="border border-[#C2BAB0] bg-white p-5 sm:p-7"><p class="text-xs font-semibold uppercase tracking-[.16em] text-[#C25A34]">Supervision paroissiale</p><div class="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><h1 class="font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Rapports des mouvements</h1><p class="mt-2 text-sm text-[#6B655D]">Vue détaillée de l’activité de chaque mouvement.</p></div><button v-if="report" @click="administrationMovementReportApi.downloadCsv(movementId, { period, year, month: period === 'monthly' ? month : undefined })" class="inline-flex min-h-11 items-center justify-center gap-2 border border-[#C2BAB0] bg-white px-4 text-sm font-semibold"><Download class="size-4" /> Exporter CSV</button></div></header>
    <div class="grid gap-3 border border-[#DDD7CF] bg-[#F7F5F2] p-4 md:grid-cols-3"><select v-model="movementId" class="min-h-11 border border-[#C2BAB0] bg-white px-3 text-sm"><option disabled value="">Choisir un mouvement</option><option v-for="movement in movements" :key="movement.id" :value="movement.id">{{ movement.name }}</option></select><select v-model="period" class="min-h-11 border border-[#C2BAB0] bg-white px-3 text-sm"><option value="monthly">Rapport mensuel</option><option value="annual">Rapport annuel</option></select><div class="flex gap-2"><select v-if="period === 'monthly'" v-model="month" class="min-h-11 flex-1 border border-[#C2BAB0] bg-white px-3 text-sm"><option v-for="(name, index) in months" :key="name" :value="index + 1">{{ name }}</option></select><input v-model.number="year" type="number" min="2020" max="2100" class="min-h-11 w-28 border border-[#C2BAB0] bg-white px-3 text-sm" /><button @click="loadReport" class="inline-flex min-h-11 items-center justify-center border border-[#C2BAB0] bg-white px-3" aria-label="Actualiser"><RefreshCw class="size-4" :class="{ 'animate-spin': loading }" /></button></div></div>
    <div v-if="error" class="border border-[#B3261E]/30 bg-[#FFF5F4] p-4 text-sm text-[#B3261E]">{{ error }}</div><div v-if="loading" class="border border-[#C2BAB0] bg-white p-6 text-sm text-[#6B655D]">Chargement du rapport...</div>
    <template v-else-if="report">
      <div class="border border-[#C2BAB0] bg-white p-5"><div class="flex flex-col justify-between gap-3 sm:flex-row"><div><p class="text-xs uppercase tracking-wide text-[#6B655D]">Mouvement</p><h2 class="mt-1 font-serif text-2xl text-[#0B1F3A]">{{ report.movement.name }}</h2><p class="text-sm text-[#6B655D]">{{ report.movement.code }} · Responsable : {{ report.movement.manager ? report.movement.manager.firstName + ' ' + report.movement.manager.lastName : 'Non renseigné' }}</p></div><div class="text-sm text-[#6B655D] sm:text-right"><p>Période</p><p class="font-semibold text-[#0B1F3A]">{{ date(report.period.start) }} — {{ date(report.period.end) }}</p></div></div></div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div v-for="card in [{ label: 'Membres actifs', value: report.members.active, icon: Users }, { label: 'Nouveaux membres', value: report.members.new, icon: Users }, { label: 'Inscriptions', value: report.registrations.total, icon: ClipboardList }, { label: 'Montant encaissé', value: money(report.finances.totalCollected), icon: Wallet }]" :key="card.label" class="border border-[#DDD7CF] bg-white p-4"><component :is="card.icon" class="size-5 text-[#24548F]" /><p class="mt-3 text-xs font-semibold uppercase tracking-wide text-[#6B655D]">{{ card.label }}</p><p class="mt-1 font-serif text-2xl text-[#14345E]">{{ card.value }}</p></div></div>
      <div class="grid gap-6 lg:grid-cols-2"><div class="border border-[#C2BAB0] bg-white p-5"><h3 class="font-serif text-xl text-[#0B1F3A]">Inscriptions</h3><div class="mt-4 grid grid-cols-2 gap-3 text-sm"><div class="bg-[#F7F5F2] p-3">En attente <strong class="float-right">{{ report.registrations.pending }}</strong></div><div class="bg-[#F7F5F2] p-3">Approuvées <strong class="float-right">{{ report.registrations.approved }}</strong></div><div class="bg-[#F7F5F2] p-3">Refusées <strong class="float-right">{{ report.registrations.rejected }}</strong></div><div class="bg-[#F7F5F2] p-3">Terminées <strong class="float-right">{{ report.registrations.completed }}</strong></div></div></div><div class="border border-[#C2BAB0] bg-white p-5"><h3 class="font-serif text-xl text-[#0B1F3A]">Activité</h3><div class="mt-4 space-y-3 text-sm"><p class="flex justify-between"><span>Membres total</span><strong>{{ report.members.total }}</strong></p><p class="flex justify-between"><span>Membres inactifs / retirés</span><strong>{{ report.members.inactive }}</strong></p><p class="flex justify-between"><span>Paiements réussis</span><strong>{{ report.finances.successfulPayments }}</strong></p><p class="flex justify-between"><span>Documents</span><strong>{{ report.documents.count }}</strong></p><p class="flex justify-between"><span>Communications</span><strong>{{ report.communications.count }}</strong></p></div></div></div>
      <div class="border border-[#C2BAB0] bg-white p-5"><h3 class="font-serif text-xl text-[#0B1F3A]">Répartition des paiements</h3><div v-if="report.finances.byPaymentMethod.length" class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div v-for="item in report.finances.byPaymentMethod" :key="item.method" class="bg-[#F7F5F2] p-3"><p class="text-xs uppercase tracking-wide text-[#6B655D]">{{ item.method }}</p><p class="mt-1 font-semibold text-[#0B1F3A]">{{ money(item.amount) }}</p></div></div><p v-else class="mt-3 text-sm text-[#6B655D]">Aucun paiement enregistré sur la période.</p></div>
      <div class="grid gap-4 sm:grid-cols-3"><div class="border border-[#DDD7CF] bg-white p-4"><FileText class="size-5 text-[#24548F]" /><p class="mt-2 text-xs uppercase text-[#6B655D]">Documents</p><strong>{{ report.documents.count }}</strong></div><div class="border border-[#DDD7CF] bg-white p-4"><MessageSquare class="size-5 text-[#24548F]" /><p class="mt-2 text-xs uppercase text-[#6B655D]">Communications</p><strong>{{ report.communications.count }}</strong></div><div class="border border-[#DDD7CF] bg-white p-4"><Users class="size-5 text-[#24548F]" /><p class="mt-2 text-xs uppercase text-[#6B655D]">Membres inactifs</p><strong>{{ report.members.inactive }}</strong></div></div>
    </template>
  </section>
</template>
