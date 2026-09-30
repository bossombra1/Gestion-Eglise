<template>
  <section class="space-y-5">
    <div class="flex items-baseline gap-4 border-b border-[#C2BAB0] pb-2">
      <span class="text-[42px] leading-none text-[#C25A34]">07</span>
      <div>
        <h1 class="font-serif text-[32px] leading-tight text-[#2E2925]">Paramètres</h1>
        <p class="mt-1 max-w-3xl text-sm leading-6 text-[#6B655D]">Informations de la paroisse, identité du secrétariat et état de synchronisation.</p>
      </div>
    </div>

    <div v-if="loading" class="border border-[#C2BAB0] bg-white p-6 text-sm text-[#6B655D]">Chargement des paramètres…</div>
    <div v-else-if="error" class="border border-[#B3261E] bg-[#FBE9E8] p-5 text-sm text-[#B3261E]">{{ error }}</div>
    <template v-else-if="data">
      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="border border-[#C2BAB0] bg-white">
          <div class="border-b border-[#EDE9E4] px-5 py-4">
            <h2 class="text-lg font-bold text-[#2E2925]">Identité de la paroisse</h2>
            <p class="mt-1 text-sm text-[#6B655D]">Ces informations sont utilisées dans les documents et communications.</p>
          </div>
          <div class="grid gap-px bg-[#EDE9E4] sm:grid-cols-2">
            <div v-for="field in fields" :key="field.label" class="bg-white p-4">
              <p class="text-[11.5px] font-bold uppercase tracking-[.06em] text-[#6B655D]">{{ field.label }}</p>
              <p class="mt-1.5 break-words text-[15px] font-semibold text-[#14345E]">{{ field.value || 'Non renseigné' }}</p>
            </div>
          </div>
        </div>

        <aside class="border border-[#C2BAB0] bg-white p-4">
          <h2 class="text-[15.5px] font-bold text-[#2E2925]">État du service</h2>
          <div class="mt-3 flex items-center gap-2 rounded bg-[#E4F1E8] px-3 py-2.5">
            <span class="size-2.5 rounded-full bg-[#14713C]"></span>
            <span class="text-sm font-semibold text-[#14713C]">Synchronisation active</span>
          </div>
          <dl class="mt-4 grid gap-3 text-sm">
            <div class="flex justify-between gap-4 border-b border-[#EDE9E4] pb-2"><dt class="text-[#6B655D]">Paroisse</dt><dd class="font-semibold text-[#2E2925]">{{ data.name }}</dd></div>
            <div class="flex justify-between gap-4 border-b border-[#EDE9E4] pb-2"><dt class="text-[#6B655D]">Code</dt><dd class="font-semibold text-[#2E2925]">{{ data.code }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-[#6B655D]">Accès</dt><dd class="font-semibold text-[#14713C]">Administration</dd></div>
          </dl>
          <div class="mt-4 bg-[#FDF3DC] p-3 text-[13px] leading-5 text-[#2E2925]">
            Les paramètres sensibles et les changements de configuration restent contrôlés par les droits d’administration.
          </div>
        </aside>
      </div>
    </template>
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
    { label: 'Code paroisse', value: data.value.code },
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
