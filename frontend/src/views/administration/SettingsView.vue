<template>
  <section class="space-y-6">
    <header class="border border-[#C2BAB0] bg-white p-6">
      <p class="eyebrow text-[#C25A34]">Configuration</p>
      <h1 class="page-title mt-2 text-3xl text-[#0B1F3A]">Paramètres</h1>
      <p class="mt-2 text-sm text-[#6B655D]">Informations de la paroisse actuellement connectée.</p>
    </header>

    <div v-if="loading" class="bg-white p-6">Chargement...</div>
    <div v-else-if="error" class="bg-white p-6 text-[#B3261E]">{{ error }}</div>
    <div v-else-if="data" class="grid gap-4 md:grid-cols-2">
      <div v-for="field in fields" :key="field.label" class="border border-[#C2BAB0] bg-white p-5">
        <p class="text-xs uppercase text-[#6B655D]">{{ field.label }}</p>
        <p class="mt-2 font-semibold text-[#14345E]">{{ field.value || 'Non renseigné' }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAdministrationSettings } from '@/services/administration-overview.service'

interface ParishSettings {
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  description: string | null
}

const data = ref<ParishSettings | null>(null)
const loading = ref(true)
const error = ref('')

const fields = computed(() => {
  if (!data.value) return []
  return [
    { label: 'Nom', value: data.value.name },
    { label: 'Code', value: data.value.code },
    { label: 'Adresse', value: data.value.address },
    { label: 'Téléphone', value: data.value.phone },
    { label: 'Email', value: data.value.email },
    { label: 'Description', value: data.value.description },
  ]
})

onMounted(async () => {
  try {
    data.value = await getAdministrationSettings()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Impossible de charger les paramètres.'
  } finally {
    loading.value = false
  }
})
</script>
