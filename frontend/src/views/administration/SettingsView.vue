<script setup lang="ts">
import { onMounted,ref } from 'vue'
import api from '@/services/api'
const loading=ref(true),error=ref(''),data=ref<any[]>([])
const load=async()=>{try{data.value=(await api.get('/administration/overview/settings')).data.data}catch{error.value='Impossible de charger les données.'}finally{loading.value=false}}
onMounted(load)
</script>
<template><section class="space-y-6"><header class="border border-[#C2BAB0] bg-white p-6"><p class="eyebrow text-[#C25A34]">Configuration</p><h1 class="page-title mt-2 text-3xl text-[#0B1F3A]">Paramètres</h1><p class="mt-2 text-sm text-[#6B655D]">Informations de la paroisse actuellement connectée.</p></header><div v-if="loading" class="bg-white p-6">Chargement...</div><div v-else-if="data" class="grid gap-4 md:grid-cols-2"><div v-for="(v,k) in {Nom:data.name,Code:data.code,Adresse:data.address,Téléphone:data.phone,Email:data.email,Description:data.description}" :key="k" class="border border-[#C2BAB0] bg-white p-5"><p class="text-xs uppercase text-[#6B655D]">{{k}}</p><p class="mt-2 font-semibold text-[#14345E]">{{v||'Non renseigné'}}</p></div></div></section></template>