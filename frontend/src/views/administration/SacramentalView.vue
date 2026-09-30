<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { FileText, Plus, Search, X, AlertTriangle } from 'lucide-vue-next'
import { sacramentalApi, type SacramentalAct, type SacramentalActPayload } from '@/services/administration-sacramental.service'

const query = ref('')
const selectedId = ref<string | null>(null)
const showNewAct = ref(false)
const acts = ref<SacramentalAct[]>([])
const error = ref('')

const form = ref<SacramentalActPayload>({
  personFirstName: '',
  personLastName: '',
  personBirthDate: '',
  type: 'BAPTISM',
  celebrationDate: '',
  celebrantName: '',
  place: '',
  registerNumber: '',
  certificateNumber: '',
  notes: '',
})

const selectedAct = computed(() => acts.value.find(a => a.id === selectedId.value) ?? acts.value[0] ?? null)

const sacramentLabel = (type: string) => ({
  BAPTISM: 'Baptême',
  CONFIRMATION: 'Confirmation',
  FIRST_COMMUNION: 'Première communion',
  MARRIAGE: 'Mariage',
  ORDINATION: 'Ordination',
  FUNERAL: 'Funérailles',
  OTHER: 'Autre',
})[type] ?? type

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR')
}

function resetForm() {
  form.value = {
    personFirstName: '',
    personLastName: '',
    personBirthDate: '',
    type: 'BAPTISM',
    celebrationDate: '',
    celebrantName: '',
    place: '',
    registerNumber: '',
    certificateNumber: '',
    notes: '',
  }
}

async function load() {
  try {
    const data = await sacramentalApi.list(query.value.trim() || undefined)
    acts.value = data.acts
    if (!selectedId.value || !acts.value.some(a => a.id === selectedId.value)) {
      selectedId.value = acts.value[0]?.id ?? null
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Impossible de charger le registre.'
  }
}

function openNewAct() {
  resetForm()
  error.value = ''
  showNewAct.value = true
}

async function createAct() {
  if (!form.value.personFirstName.trim() || !form.value.personLastName.trim()) {
    error.value = 'Le prénom et le nom de la personne sont obligatoires.'
    return
  }
  if (!form.value.celebrationDate) {
    error.value = 'Renseignez la date du sacrement.'
    return
  }

  try {
    const created = await sacramentalApi.create(form.value)
    showNewAct.value = false
    error.value = ''
    await load()
    selectedId.value = created.id
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Impossible d’inscrire l’acte.'
  }
}

onMounted(load)
</script>

<template>
  <section class="min-w-0">
    <div class="mb-4 border-b border-[#C2BAB0] pb-4">
      <div class="flex items-baseline gap-3">
        <span class="font-['Source_Serif_4'] text-[38px] leading-none text-[#C25A34]">03</span>
        <h1 class="font-['Source_Serif_4'] text-[32px] font-semibold leading-none text-[#2E2925] sm:text-[38px]">Registre sacramentel</h1>
      </div>
      <p class="mt-2 max-w-3xl text-[13.5px] leading-5 text-[#4A443E]">Cette vue gère uniquement les actes du registre sacramentel. Une personne inscrite dans le registre n'a pas besoin d'avoir un compte dans l'application.</p>
    </div>

    <div v-if="error" class="mb-3 rounded-[5px] border border-[#B3261E] bg-[#FBE9E8] p-3 text-[13.5px] text-[#7A1B16]">
      {{ error }}
    </div>

    <div class="overflow-hidden rounded-[6px] border border-[#C2BAB0] bg-[#F7F5F2]">
      <header class="flex flex-col gap-3 border-b border-[#DDD7CF] bg-white px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <div>
          <h2 class="text-[20px] font-bold text-[#2E2925]">Registre sacramentel</h2>
          <p class="text-[13.5px] text-[#6B655D]">{{ acts.length }} acte(s) affiché(s)</p>
        </div>
        <div class="flex flex-1 justify-end gap-2">
          <label class="flex min-h-9 w-full max-w-[320px] items-center gap-2 rounded-[5px] border-[1.5px] border-[#C2BAB0] bg-white px-2.5">
            <Search class="size-4 text-[#6B655D]" />
            <input v-model="query" @input="load" class="min-w-0 flex-1 border-0 bg-transparent text-[14px] outline-none" placeholder="Rechercher dans le registre" />
            <button v-if="query" type="button" @click="query=''; load()" class="text-[#6B655D]"><X class="size-3.5" /></button>
          </label>
          <button type="button" @click="openNewAct" class="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-[5px] bg-[#14345E] px-3.5 text-[13.5px] font-bold text-white hover:bg-[#0E2A4E]">
            <Plus class="size-4" /> Nouvel acte
          </button>
        </div>
      </header>

      <div class="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_400px]">
        <main class="min-w-0 p-4 sm:p-[16px_18px]">
          <div class="overflow-hidden rounded-[5px] border border-[#EDE9E4] bg-white">
            <div class="flex items-center gap-2 border-b border-[#EDE9E4] px-3.5 py-2.5">
              <FileText class="size-4 text-[#A84A28]" />
              <div class="text-[15px] font-bold text-[#2E2925]">Actes inscrits</div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[760px] text-[14px]">
                <thead class="bg-[#FBFAF8] text-left text-[11.5px] uppercase tracking-[0.05em] text-[#6B655D]">
                  <tr>
                    <th class="px-3.5 py-2.5">Personne</th>
                    <th class="px-3.5 py-2.5">Sacrement</th>
                    <th class="px-3.5 py-2.5">Date</th>
                    <th class="px-3.5 py-2.5">Registre</th>
                    <th class="px-3.5 py-2.5">Certificat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="act in acts"
                    :key="act.id"
                    @click="selectedId=act.id"
                    class="cursor-pointer border-t border-[#EDE9E4] hover:bg-[#FBFAF8]"
                    :class="selectedAct?.id === act.id ? 'bg-[#E8EDF5]' : ''"
                  >
                    <td class="px-3.5 py-3 font-semibold text-[#2E2925]">{{ act.personFirstName }} {{ act.personLastName }}</td>
                    <td class="px-3.5 py-3">{{ sacramentLabel(act.type) }}</td>
                    <td class="px-3.5 py-3 whitespace-nowrap">{{ formatDate(act.celebrationDate) }}</td>
                    <td class="px-3.5 py-3 text-[13px]">{{ act.registerNumber || '—' }}</td>
                    <td class="px-3.5 py-3 font-semibold text-[#A84A28]">{{ act.certificateNumber || '—' }}</td>
                  </tr>
                  <tr v-if="!acts.length">
                    <td colspan="5" class="px-3.5 py-10 text-center text-[13.5px] text-[#6B655D]">Aucun acte sacramentel enregistré.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <aside class="border-t border-[#EDE9E4] bg-white p-4 xl:border-l xl:border-t-0">
          <div class="mb-2.5 text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#A84A28]">Aperçu avant impression</div>
          <div v-if="selectedAct" class="rounded-[5px] bg-[#F7F5F2] p-3.5">
            <div class="bg-white p-5 shadow-sm">
              <div class="border-b border-[#DDD7CF] pb-2 text-center">
                <div class="text-[10.5px] uppercase tracking-[0.12em] text-[#6B655D]">Archidiocèse d'Abidjan</div>
                <div class="text-[12.5px] font-semibold text-[#2E2925]">Paroisse</div>
              </div>
              <div class="py-3 text-center text-[16px] font-bold text-[#14345E]">CERTIFICAT DE {{ sacramentLabel(selectedAct.type).toUpperCase() }}</div>
              <p class="text-[12.5px] leading-[1.7] text-[#2E2925]">Je soussigné, curé de la paroisse, certifie qu'il résulte du registre sacramentel que :</p>
              <div class="my-2 border-l-2 border-[#C25A34] pl-2.5 text-[12.5px] leading-[1.7]">
                <strong>{{ (selectedAct.personFirstName + ' ' + selectedAct.personLastName).toUpperCase() }}</strong><br>
                <span v-if="selectedAct.personBirthDate">Né(e) le {{ formatDate(selectedAct.personBirthDate) }}<br></span>
                {{ sacramentLabel(selectedAct.type) }} célébré(e) le {{ formatDate(selectedAct.celebrationDate) }}.<br>
                <span v-if="selectedAct.place">Lieu : {{ selectedAct.place }}.<br></span>
                <span v-if="selectedAct.celebrantName">Célébrant : {{ selectedAct.celebrantName }}.<br></span>
                <span v-if="selectedAct.registerNumber">Registre : {{ selectedAct.registerNumber }}.</span>
              </div>
              <div v-if="selectedAct.notes" class="mt-3 border-t border-[#EDE9E4] pt-2 text-[11.5px] leading-5 text-[#4A443E]">{{ selectedAct.notes }}</div>
              <div class="mt-4 text-[11px] text-[#6B655D]">{{ formatDate(selectedAct.celebrationDate) }}</div>
            </div>
          </div>
          <div v-else class="rounded-[5px] bg-[#F7F5F2] p-5 text-[13.5px] leading-5 text-[#6B655D]">
            Aucun acte à prévisualiser. Inscrivez un acte pour commencer le registre.
          </div>
          <div v-if="selectedAct" class="mt-3 rounded-[5px] border border-[#B3261E] bg-[#FBE9E8] p-3 text-[13.5px] leading-5 text-[#2E2925]">
            Document officiel numéroté. Les informations affichées proviennent directement de l'acte sélectionné.
          </div>
        </aside>
      </div>
    </div>

    <div v-if="showNewAct" class="fixed inset-0 z-50 grid place-items-center bg-[#0B1F3A]/50 p-4" @click.self="showNewAct=false">
      <div class="w-full max-w-2xl overflow-hidden rounded-[6px] border border-[#C2BAB0] bg-white shadow-xl">
        <div class="border-b border-[#EDE9E4] p-4">
          <h2 class="text-[19px] font-bold text-[#2E2925]">Inscrire un acte</h2>
          <p class="text-[13.5px] text-[#6B655D]">Saisissez les informations de la personne telles qu'elles doivent apparaître dans le registre.</p>
        </div>
        <div class="flex gap-2 border-b border-[#B3261E] bg-[#FBE9E8] p-3 text-[13.5px] leading-5">
          <AlertTriangle class="size-5 shrink-0 text-[#B3261E]" />
          <span><strong class="text-[#B3261E]">Un acte inscrit ne peut plus être supprimé.</strong> Vérifiez chaque champ avant inscription.</span>
        </div>
        <div class="grid gap-3 p-4 sm:grid-cols-2">
          <label class="text-[13.5px] font-semibold">Prénom
            <input v-model="form.personFirstName" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" />
          </label>
          <label class="text-[13.5px] font-semibold">Nom
            <input v-model="form.personLastName" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" />
          </label>
          <label class="text-[13.5px] font-semibold">Date de naissance
            <input v-model="form.personBirthDate" type="date" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" />
          </label>
          <label class="text-[13.5px] font-semibold">Sacrement
            <select v-model="form.type" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] bg-white px-3 font-normal">
              <option value="BAPTISM">Baptême</option>
              <option value="CONFIRMATION">Confirmation</option>
              <option value="FIRST_COMMUNION">Première communion</option>
              <option value="MARRIAGE">Mariage</option>
              <option value="ORDINATION">Ordination</option>
              <option value="FUNERAL">Funérailles</option>
              <option value="OTHER">Autre</option>
            </select>
          </label>
          <label class="text-[13.5px] font-semibold">Date du sacrement
            <input v-model="form.celebrationDate" type="date" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" />
          </label>
          <label class="text-[13.5px] font-semibold">Ministre / célébrant
            <input v-model="form.celebrantName" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" />
          </label>
          <label class="text-[13.5px] font-semibold">Lieu
            <input v-model="form.place" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" />
          </label>
          <label class="text-[13.5px] font-semibold">N° de registre
            <input v-model="form.registerNumber" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" />
          </label>
          <label class="text-[13.5px] font-semibold">N° de certificat
            <input v-model="form.certificateNumber" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" />
          </label>
          <label class="text-[13.5px] font-semibold sm:col-span-2">Notes
            <textarea v-model="form.notes" rows="3" class="mt-1 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 py-2 font-normal"></textarea>
          </label>
        </div>
        <div class="flex justify-end gap-2 p-4 pt-0">
          <button type="button" @click="showNewAct=false" class="min-h-10 rounded-[5px] border-[1.5px] border-[#C2BAB0] px-4 text-[14px] font-semibold">Annuler</button>
          <button type="button" @click="createAct" class="min-h-10 rounded-[5px] bg-[#14345E] px-4 text-[14px] font-bold text-white hover:bg-[#0E2A4E]">Inscrire définitivement au registre</button>
        </div>
      </div>
    </div>
  </section>
</template>
