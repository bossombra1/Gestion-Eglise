<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ArrowLeft, Download, RefreshCw, Users, ClipboardList, Wallet, FileText, MessageSquare } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { administrationMovementReportApi, type MovementReport } from '@/services/administration-movement-report.service'
const route=useRoute(),router=useRouter()
const report=ref<MovementReport|null>(null),loading=ref(true),error=ref('')
const period=ref<'monthly'|'annual'>('monthly'),year=ref(new Date().getFullYear()),month=ref(new Date().getMonth()+1)
const id=computed(()=>String(route.params.id))
const money=(n:number)=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(n)+' FCFA'
const load=async()=>{loading.value=true;error.value='';try{report.value=await administrationMovementReportApi.get(id.value,{period:period.value,year:year.value,month:period.value==='monthly'?month.value:undefined})}catch{error.value='Impossible de charger le rapport.'}finally{loading.value=false}}
const csv=async()=>{try{await administrationMovementReportApi.downloadCsv(id.value,{period:period.value,year:year.value,month:period.value==='monthly'?month.value:undefined})}catch{error.value='Impossible de générer le CSV.'}}
onMounted(load)
</script>
<template>
<section class="space-y-6">
<div class="flex flex-wrap items-center justify-between gap-3">
<button class="inline-flex items-center gap-2 text-sm font-semibold text-[#24548F]" @click="router.push('/administration/mouvements')"><ArrowLeft class="size-4"/> Mouvements & rapports</button>
<button class="inline-flex min-h-10 items-center gap-2 border border-[#C2BAB0] bg-white px-4 text-sm font-semibold hover:bg-[#F7F5F2]" @click="csv"><Download class="size-4"/> Exporter CSV</button>
</div>
<header v-if="report" class="border border-[#C2BAB0] bg-white p-5 sm:p-7"><p class="eyebrow text-[#C25A34]">{{ report.movement.code }}</p><h1 class="page-title mt-2 text-3xl text-[#0B1F3A] sm:text-4xl">{{ report.movement.name }}</h1><p class="mt-2 text-sm text-[#6B655D]">{{ report.movement.description || 'Rapport de supervision du mouvement.' }}</p></header>
<div class="flex flex-wrap gap-3 border border-[#C2BAB0] bg-white p-4">
<select v-model="period" @change="load" class="min-h-10 border border-[#C2BAB0] bg-white px-3 text-sm"><option value="monthly">Rapport mensuel</option><option value="annual">Rapport annuel</option></select>
<select v-model="month" v-if="period==='monthly'" @change="load" class="min-h-10 border border-[#C2BAB0] bg-white px-3 text-sm"><option v-for="m in 12" :key="m" :value="m">{{ new Date(2000,m-1,1).toLocaleDateString('fr-FR',{month:'long'}) }}</option></select>
<input v-model.number="year" @change="load" type="number" min="2020" max="2100" class="min-h-10 w-28 border border-[#C2BAB0] px-3 text-sm"/>
<button @click="load" class="inline-flex min-h-10 items-center gap-2 border border-[#C2BAB0] bg-white px-4 text-sm font-semibold"><RefreshCw class="size-4" :class="loading?'animate-spin':''"/> Actualiser</button>
</div>
<div v-if="error" class="border border-[#B3261E]/30 bg-[#FFF5F4] p-4 text-sm text-[#B3261E]">{{ error }}</div>
<div v-if="loading" class="border border-[#C2BAB0] bg-white p-6 text-sm text-[#6B655D]">Génération du rapport...</div>
<template v-else-if="report">
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
<div v-for="k in [{l:'Membres',v:report.members.total,i:Users},{l:'Inscriptions',v:report.registrations.total,i:ClipboardList},{l:'Paiements réussis',v:report.finances.successfulPayments,i:Wallet},{l:'Documents',v:report.documents.count,i:FileText}]" :key="k.l" class="border border-[#C2BAB0] bg-white p-5"><component :is="k.i" class="size-5 text-[#C25A34]"/><p class="mt-3 text-xs uppercase tracking-wide text-[#6B655D]">{{k.l}}</p><p class="mt-1 font-serif text-3xl text-[#14345E]">{{k.v}}</p></div>
</div>
<div class="grid gap-5 lg:grid-cols-2">
<article class="border border-[#C2BAB0] bg-white p-5"><h2 class="font-serif text-xl text-[#14345E]">Membres</h2><div class="mt-4 grid grid-cols-3 gap-3 text-sm"><div>Actifs<strong class="block text-xl">{{report.members.active}}</strong></div><div>Nouveaux<strong class="block text-xl">{{report.members.new}}</strong></div><div>Inactifs/retirés<strong class="block text-xl">{{report.members.inactive}}</strong></div></div></article>
<article class="border border-[#C2BAB0] bg-white p-5"><h2 class="font-serif text-xl text-[#14345E]">Inscriptions</h2><div class="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3"><div>En attente<strong class="block text-xl">{{report.registrations.pending}}</strong></div><div>Approuvées<strong class="block text-xl">{{report.registrations.approved}}</strong></div><div>Rejetées<strong class="block text-xl">{{report.registrations.rejected}}</strong></div><div>Annulées<strong class="block text-xl">{{report.registrations.cancelled}}</strong></div><div>Terminées<strong class="block text-xl">{{report.registrations.completed}}</strong></div></div></article>
<article class="border border-[#C2BAB0] bg-white p-5"><h2 class="font-serif text-xl text-[#14345E]">Finances</h2><p class="mt-4 text-3xl font-semibold text-[#14713C]">{{money(report.finances.totalCollected)}}</p><p class="mt-1 text-sm text-[#6B655D]">{{report.finances.successfulPayments}} paiement(s) réussi(s) sur la période.</p><div class="mt-4 space-y-2 text-sm"><div v-for="item in report.finances.byPaymentMethod" :key="item.method" class="flex justify-between border-b border-[#EDE9E4] pb-2"><span>{{item.method}}</span><strong>{{money(item.amount)}}</strong></div></div></article>
<article class="border border-[#C2BAB0] bg-white p-5"><h2 class="font-serif text-xl text-[#14345E]">Communications & documents</h2><p class="mt-4 flex items-center gap-2 text-sm"><MessageSquare class="size-4"/> {{report.communications.count}} communication(s)</p><p class="mt-3 flex items-center gap-2 text-sm"><FileText class="size-4"/> {{report.documents.count}} document(s)</p></article>
</div>
</template>
</section>
</template>
