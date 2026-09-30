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
          <div class="flex flex-col gap-3 border-b border-[#EDE9E4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-bold text-[#2E2925]">Identité de la paroisse</h2>
              <p class="mt-1 text-sm text-[#6B655D]">Ces informations sont utilisées dans les documents et communications.</p>
            </div>
            <button v-if="!editing" type="button" class="border border-[#14345E] bg-[#14345E] px-4 py-2 text-sm font-bold text-white hover:bg-[#24548F]" @click="startEditing">
              Modifier
            </button>
          </div>

          <form v-if="editing" class="p-5" @submit.prevent="save">
            <div class="grid gap-4 sm:grid-cols-2">
              <label v-for="field in editableFields" :key="field.key" class="block" :class="field.key === 'description' ? 'sm:col-span-2' : ''">
                <span class="text-[11.5px] font-bold uppercase tracking-[.06em] text-[#6B655D]">{{ field.label }}</span>
                <textarea v-if="field.key === 'description'" v-model="form.description" rows="4" class="mt-1.5 w-full resize-y border border-[#C2BAB0] bg-white px-3 py-2.5 text-sm text-[#2E2925] outline-none focus:border-[#14345E] focus:ring-1 focus:ring-[#14345E]" :placeholder="field.placeholder" />
                <input v-else v-model="form[field.key]" :type="field.type" :required="field.required" class="mt-1.5 w-full border border-[#C2BAB0] bg-white px-3 py-2.5 text-sm text-[#2E2925] outline-none focus:border-[#14345E] focus:ring-1 focus:ring-[#14345E]" :placeholder="field.placeholder" />
              </label>
            </div>

            <div v-if="formError" class="mt-4 border border-[#B3261E] bg-[#FBE9E8] px-4 py-3 text-sm text-[#B3261E]">{{ formError }}</div>
            <div v-if="saved" class="mt-4 border border-[#14713C] bg-[#E4F1E8] px-4 py-3 text-sm font-semibold text-[#14713C]">Les paramètres ont été enregistrés.</div>

            <div class="mt-5 flex flex-col-reverse gap-2 border-t border-[#EDE9E4] pt-4 sm:flex-row sm:justify-end">
              <button type="button" class="border border-[#C2BAB0] bg-white px-4 py-2 text-sm font-semibold text-[#2E2925] hover:bg-[#F7F5F2]" :disabled="saving" @click="cancelEditing">Annuler</button>
              <button type="submit" class="bg-[#14345E] px-4 py-2 text-sm font-bold text-white hover:bg-[#24548F] disabled:cursor-not-allowed disabled:opacity-60" :disabled="saving">
                {{ saving ? 'Enregistrement…' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </form>

          <div v-else class="grid gap-px bg-[#EDE9E4] sm:grid-cols-2">
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
import { computed, onMounted, reactive, ref } from 'vue'
import { getAdministrationSettings, updateAdministrationSettings } from '@/services/administration-overview.service'

interface ParishSettings {
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  description: string | null
}

type EditableKey = keyof ParishSettings
type SettingsForm = Record<EditableKey, string>

const data = ref<ParishSettings | null>(null)
const loading = ref(true)
const saving = ref(false)
const editing = ref(false)
const error = ref('')
const formError = ref('')
const saved = ref(false)

const form = reactive<SettingsForm>({
  name: '',
  code: '',
  address: '',
  phone: '',
  email: '',
  description: '',
})

const editableFields: Array<{ key: EditableKey; label: string; type: string; required?: boolean; placeholder: string }> = [
  { key: 'name', label: 'Nom', type: 'text', required: true, placeholder: 'Nom de la paroisse' },
  { key: 'code', label: 'Code paroisse', type: 'text', required: true, placeholder: 'Ex. ECC-001' },
  { key: 'address', label: 'Adresse', type: 'text', placeholder: 'Adresse complète' },
  { key: 'phone', label: 'Téléphone', type: 'tel', placeholder: '+225 …' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'secretariat@paroisse.ci' },
  { key: 'description', label: 'Description', type: 'text', placeholder: 'Présentation courte de la paroisse' },
]

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

function syncForm(source: ParishSettings) {
  form.name = source.name
  form.code = source.code
  form.address = source.address ?? ''
  form.phone = source.phone ?? ''
  form.email = source.email ?? ''
  form.description = source.description ?? ''
}

function startEditing() {
  if (!data.value) return
  syncForm(data.value)
  formError.value = ''
  saved.value = false
  editing.value = true
}

function cancelEditing() {
  if (data.value) syncForm(data.value)
  formError.value = ''
  saved.value = false
  editing.value = false
}

async function save() {
  if (!data.value) return
  saving.value = true
  formError.value = ''
  saved.value = false
  try {
    const updated = await updateAdministrationSettings({ ...form })
    data.value = updated
    syncForm(updated)
    saved.value = true
    editing.value = false
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Impossible d’enregistrer les paramètres.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    data.value = await getAdministrationSettings()
    syncForm(data.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Impossible de charger les paramètres.'
  } finally {
    loading.value = false
  }
})
</script>
