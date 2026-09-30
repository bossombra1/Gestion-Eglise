<script setup lang="ts">
import { onMounted,ref } from 'vue'
import api from '@/services/api'
const loading=ref(true),error=ref(''),data=ref<any[]>([])
const load=async()=>{loading.value=true;error.value='';try{const r=await api.get('/administration/overview/communications');data.value=r.data.data}catch{error.value='Impossible de charger les données.'}finally{loading.value=false}}
onMounted(load)
</script>
<template><section class="space-y-6"><header class="border border-[#C2BAB0] bg-white p-6"><p class="eyebrow text-[#C25A34]">Vie paroissiale</p><h1 class="page-title mt-2 text-3xl text-[#0B1F3A]">Communications</h1><p class="mt-2 text-sm text-[#6B655D]">Historique des communications de la paroisse.</p></header><div v-if="loading" class="bg-white p-6">Chargement...</div><div v-else-if="error" class="bg-white p-6 text-[#B3261E]">{{error}}</div><div v-else class="space-y-3"><article v-for="item in data" :key="item.id" class="border border-[#C2BAB0] bg-white p-5"><div class="flex justify-between gap-3"><h2 class="font-serif text-xl text-[#14345E]">{{item.title}}</h2><span class="text-xs font-semibold">{{item.status}}</span></div><p class="mt-2 text-sm text-[#6B655D] line-clamp-3">{{item.content}}</p><p class="mt-3 text-xs text-[#6B655D]">{{item.movement?.name || 'Paroisse'}} · {{new Date(item.createdAt).toLocaleDateString('fr-FR')}}</p></article></div></section></template>