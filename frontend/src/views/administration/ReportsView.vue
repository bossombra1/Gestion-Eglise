<script setup lang="ts">
import { onMounted,ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
const router=useRouter(),loading=ref(true),error=ref(''),movements=ref<any[]>([])
onMounted(async()=>{try{movements.value=(await api.get('/administration/mouvements')).data.data}catch{error.value='Impossible de charger les mouvements.'}finally{loading.value=false}})
</script>
<template><section class="space-y-6"><header class="border border-[#C2BAB0] bg-white p-6"><p class="eyebrow text-[#C25A34]">Supervision</p><h1 class="page-title mt-2 text-3xl text-[#0B1F3A]">Rapports</h1><p class="mt-2 text-sm text-[#6B655D]">Sélectionnez un mouvement pour consulter ses rapports mensuels ou annuels.</p></header><div v-if="loading" class="bg-white p-6">Chargement...</div><div v-else-if="error" class="bg-white p-6 text-[#B3261E]">{{error}}</div><div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><button v-for="m in movements" :key="m.id" class="border border-[#C2BAB0] bg-white p-5 text-left hover:border-[#24548F]" @click="router.push('/administration/mouvements/'+m.id)"><p class="text-xs uppercase text-[#C25A34]">{{m.code}}</p><h2 class="mt-2 font-serif text-xl text-[#14345E]">{{m.name}}</h2><p class="mt-2 text-sm text-[#6B655D]">{{m._count.members}} membre(s) · {{m._count.registrations}} inscription(s)</p></button></div></section></template>