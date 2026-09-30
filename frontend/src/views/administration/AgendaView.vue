<script setup lang="ts">
import { onMounted,ref } from 'vue'
import api from '@/services/api'
const loading=ref(true),error=ref(''),data=ref<any[]>([])
const load=async()=>{try{data.value=(await api.get('/administration/overview/agenda')).data.data}catch{error.value='Impossible de charger les données.'}finally{loading.value=false}}
onMounted(load)
</script>
<template><section class="space-y-6"><header class="border border-[#C2BAB0] bg-white p-6"><p class="eyebrow text-[#C25A34]">Planning</p><h1 class="page-title mt-2 text-3xl text-[#0B1F3A]">Agenda</h1><p class="mt-2 text-sm text-[#6B655D]">Créneaux liés aux intentions de messe enregistrées.</p></header><div v-if="loading" class="bg-white p-6">Chargement...</div><div v-else class="grid gap-3 md:grid-cols-2 lg:grid-cols-3"><article v-for="i in data" :key="i.id" class="border border-[#C2BAB0] bg-white p-5"><p class="text-xs font-semibold uppercase text-[#C25A34]">{{new Date(i.requestedDate).toLocaleDateString('fr-FR')}}</p><h2 class="mt-2 font-serif text-xl text-[#14345E]">{{i.timeSlot||'Horaire non défini'}}</h2><p class="mt-2 text-sm">{{i.intention}}</p><p class="mt-3 text-xs text-[#6B655D]">{{i.status}}</p></article></div></section></template>