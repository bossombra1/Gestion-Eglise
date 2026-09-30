<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, RefreshCw, Users } from 'lucide-vue-next'
import { administrationUsersApi, type AdministrationUser } from '@/services/administration-users.service'
const users=ref<AdministrationUser[]>([]),loading=ref(true),error=ref(''),search=ref(''),role=ref(''),status=ref('')
const load=async()=>{loading.value=true;error.value='';try{users.value=await administrationUsersApi.list({search:search.value||undefined,role:role.value||undefined,status:status.value||undefined})}catch{error.value='Impossible de charger les utilisateurs.'}finally{loading.value=false}}
onMounted(load)
let timer:number|undefined
const onSearch=()=>{window.clearTimeout(timer);timer=window.setTimeout(load,300)}
const roleLabel=(r:string)=>({ADMIN_PARISH:'Administrateur',MOVEMENT_MANAGER:'Responsable mouvement',PARENT:'Parent',FAITHFUL:'Fidèle',SECRETARY:'Secrétaire',PRIEST:'Prêtre',TREASURER:'Trésorier',SUPER_ADMIN:'Super administrateur'}[r]??r)
const statusLabel=(s:string)=>s==='ACTIVE'?'Actif':s==='INACTIVE'?'Inactif':'Suspendu'
const activeCount=computed(()=>users.value.filter(u=>u.status==='ACTIVE').length)
</script>
<template>
<section class="space-y-6">
<header class="border border-[#C2BAB0] bg-white p-5 sm:p-7"><p class="eyebrow text-[#C25A34]">Administration paroissiale</p><h1 class="page-title mt-2 text-3xl text-[#0B1F3A] sm:text-4xl">Utilisateurs</h1><p class="mt-2 text-sm text-[#6B655D]">{{ users.length }} utilisateur(s) affiché(s) · {{ activeCount }} actif(s)</p></header>
<div class="flex flex-col gap-3 lg:flex-row">
<div class="relative flex-1"><Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B655D]"/><input v-model="search" @input="onSearch" class="min-h-11 w-full border border-[#C2BAB0] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#24548F]" placeholder="Rechercher un nom, email ou téléphone"/></div>
<select v-model="role" @change="load" class="min-h-11 border border-[#C2BAB0] bg-white px-3 text-sm"><option value="">Tous les rôles</option><option value="ADMIN_PARISH">Administrateur</option><option value="MOVEMENT_MANAGER">Responsable mouvement</option><option value="PARENT">Parent</option><option value="FAITHFUL">Fidèle</option><option value="SECRETARY">Secrétaire</option><option value="PRIEST">Prêtre</option><option value="TREASURER">Trésorier</option></select>
<select v-model="status" @change="load" class="min-h-11 border border-[#C2BAB0] bg-white px-3 text-sm"><option value="">Tous les statuts</option><option value="ACTIVE">Actif</option><option value="INACTIVE">Inactif</option><option value="SUSPENDED">Suspendu</option></select>
<button @click="load" class="inline-flex min-h-11 items-center justify-center gap-2 border border-[#C2BAB0] bg-white px-4 text-sm font-semibold hover:bg-[#F7F5F2]"><RefreshCw class="size-4" :class="loading?'animate-spin':''"/> Actualiser</button>
</div>
<div v-if="error" class="border border-[#B3261E]/30 bg-[#FFF5F4] p-4 text-sm text-[#B3261E]">{{ error }}</div>
<div class="overflow-hidden border border-[#C2BAB0] bg-white">
<div v-if="loading" class="p-6 text-sm text-[#6B655D]">Chargement...</div>
<div v-else-if="!users.length" class="flex flex-col items-center gap-2 p-10 text-center"><Users class="size-8 text-[#C25A34]"/><p class="font-semibold text-[#2E2925]">Aucun utilisateur trouvé</p></div>
<div v-else class="overflow-x-auto"><table class="w-full min-w-[760px] text-left text-sm"><thead class="border-b border-[#DDD7CF] bg-[#F7F5F2]"><tr><th class="px-5 py-3">Utilisateur</th><th class="px-5 py-3">Contact</th><th class="px-5 py-3">Rôle</th><th class="px-5 py-3">Statut</th></tr></thead><tbody><tr v-for="user in users" :key="user.id" class="border-b border-[#EDE9E4] last:border-0"><td class="px-5 py-4"><p class="font-semibold text-[#2E2925]">{{ user.firstName }} {{ user.lastName }}</p><p class="text-xs text-[#6B655D]">{{ user.email || '—' }}</p></td><td class="px-5 py-4 text-[#6B655D]">{{ user.phone || '—' }}</td><td class="px-5 py-4">{{ roleLabel(user.role) }}</td><td class="px-5 py-4"><span :class="user.status==='ACTIVE'?'text-[#14713C]':'text-[#B3261E]'" class="font-semibold">{{ statusLabel(user.status) }}</span></td></tr></tbody></table></div>
</div></section>
</template>