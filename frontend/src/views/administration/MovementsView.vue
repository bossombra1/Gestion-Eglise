<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Search, RefreshCw, Users, ClipboardList, ArrowRight } from 'lucide-vue-next'
import { administrationMovementsApi, type AdministrationMovement } from '@/services/administration-movements.service'
const movements=ref<AdministrationMovement[]>([]),loading=ref(true),error=ref(''),search=ref(''),status=ref('')
const load=async()=>{loading.value=true;error.value='';try{movements.value=await administrationMovementsApi.list({search:search.value||undefined,status:status.value||undefined})}catch{error.value='Impossible de charger les mouvements.'}finally{loading.value=false}}
onMounted(load)
let timer:number|undefined
const onSearch=()=>{window.clearTimeout(timer);timer=window.setTimeout(load,300)}
const statusLabel=(s:string)=>s==='ACTIVE'?'Actif':s==='INACTIVE'?'Inactif':s==='ARCHIVED'?'Archivé':s
</script>
<template>
<section class="space-y-6">
<header class="border border-[#C2BAB0] bg-white p-5 sm:p-7"><p class="eyebrow text-[#C25A34]">Supervision paroissiale</p><h1 class="page-title mt-2 text-3xl text-[#0B1F3A] sm:text-4xl">Mouvements</h1><p class="mt-2 text-sm text-[#6B655D]">Vue consolidée des mouvements et de leur activité.</p></header>
<div class="flex flex-col gap-3 lg:flex-row">
<div class="relative flex-1"><Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B655D]"/><input v-model="search" @input="onSearch" class="min-h-11 w-full border border-[#C2BAB0] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#24548F]" placeholder="Rechercher un mouvement ou un code"/></div>
<select v-model="status" @change="load" class="min-h-11 border border-[#C2BAB0] bg-white px-3 text-sm"><option value="">Tous les statuts</option><option value="ACTIVE">Actif</option><option value="INACTIVE">Inactif</option><option value="ARCHIVED">Archivé</option></select>
<button @click="load" class="inline-flex min-h-11 items-center justify-center gap-2 border border-[#C2BAB0] bg-white px-4 text-sm font-semibold hover:bg-[#F7F5F2]"><RefreshCw class="size-4" :class="loading?'animate-spin':''"/> Actualiser</button>
</div>
<div v-if="error" class="border border-[#B3261E]/30 bg-[#FFF5F4] p-4 text-sm text-[#B3261E]">{{ error }}</div>
<div v-if="loading" class="border border-[#C2BAB0] bg-white p-6 text-sm text-[#6B655D]">Chargement...</div>
<div v-else-if="!movements.length" class="border border-dashed border-[#C2BAB0] bg-white p-10 text-center"><p class="font-semibold text-[#2E2925]">Aucun mouvement trouvé</p></div>
<div v-else class="grid gap-5 lg:grid-cols-2">
<article v-for="movement in movements" :key="movement.id" class="border border-[#C2BAB0] bg-white p-6">
<div class="flex items-start justify-between gap-4"><div><p class="eyebrow text-[#6B655D]">{{ movement.code }}</p><h2 class="page-title mt-1 text-2xl text-[#14345E]">{{ movement.name }}</h2></div><span class="text-sm font-semibold" :class="movement.status==='ACTIVE'?'text-[#14713C]':movement.status==='ARCHIVED'?'text-[#6B655D]':'text-[#8A5200]'">{{ statusLabel(movement.status) }}</span></div>
<p class="mt-4 text-sm leading-6 text-[#6B655D]">{{ movement.description || 'Aucune description renseignée.' }}</p>
<div class="mt-5 grid gap-3 sm:grid-cols-2"><div class="border border-[#EDE9E4] bg-[#F7F5F2] p-4"><p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#6B655D]"><Users class="size-4"/> Membres</p><p class="mt-1 font-serif text-2xl text-[#14345E]">{{ movement._count.members }}</p></div><div class="border border-[#EDE9E4] bg-[#F7F5F2] p-4"><p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#6B655D]"><ClipboardList class="size-4"/> Inscriptions</p><p class="mt-1 font-serif text-2xl text-[#14345E]">{{ movement._count.registrations }}</p></div></div>
<div class="mt-5 border-t border-[#EDE9E4] pt-4"><p class="text-xs font-semibold uppercase tracking-wide text-[#6B655D]">Responsable</p><p v-if="movement.manager" class="mt-1 font-semibold text-[#2E2925]">{{ movement.manager.firstName }} {{ movement.manager.lastName }}</p><p v-else class="mt-1 text-sm text-[#6B655D]">Aucun responsable affecté</p><p v-if="movement.manager?.email" class="text-xs text-[#6B655D]">{{ movement.manager.email }}</p></div>
</article></div>
</section>
</template>