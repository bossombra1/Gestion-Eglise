<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { FileText, Plus, Search, X, AlertTriangle } from 'lucide-vue-next'
import { sacramentalApi, type SacramentalAct } from '@/services/administration-sacramental.service'

const query = ref('')
const selected = ref(0)
const showNewAct = ref(false)
const people = ref<{ name: string; birth: string; id: string }[]>([])
const acts = ref<SacramentalAct[]>([])
const form = ref({
  personId: '',
  type: 'BAPTISM',
  celebrationDate: '',
  celebrantName: '',
  place: '',
  registerNumber: '',
  certificateNumber: '',
  notes: '',
})
const error = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? people.value.filter(p => p.name.toLowerCase().includes(q)) : people.value
})

const person = computed(() => filtered.value[selected.value] ?? filtered.value[0] ?? null)
const selectedActs = computed(() => person.value ? acts.value.filter(a => a.personId === person.value!.id) : [])
const selectedAct = computed(() => selectedActs.value[0] ?? null)
const rows = computed(() => selectedActs.value.map(a => ({
  s: a.type,
  d: new Date(a.celebrationDate).toLocaleDateString('fr-FR'),
  r: a.registerNumber || '—',
  c: a.certificateNumber || '—',
  id: a.id,
})))

const sacramentLabel = (type: string) => ({
  BAPTISM: 'Baptême',
  CONFIRMATION: 'Confirmation',
  FIRST_COMMUNION: 'Première communion',
  MARRIAGE: 'Mariage',
  ORDINATION: 'Ordination',
  ANOINTING: 'Onction des malades',
  RECONCILIATION: 'Réconciliation',
})[type] ?? type

async function load() {
  try {
    const d = await sacramentalApi.list(query.value.trim() || undefined)
    acts.value = d.acts
    people.value = d.people.map(p => ({
      id: p.id,
      name: p.firstName + ' ' + p.lastName,
      birth: p.faithfulProfile?.birthDate
        ? 'Né(e) le ' + new Date(p.faithfulProfile.birthDate).toLocaleDateString('fr-FR')
        : 'Date de naissance non renseignée',
    }))
    if (selected.value >= people.value.length) selected.value = 0
  } catch {
    error.value = 'Impossible de charger le registre.'
  }
}

function openNewAct() {
  if (!person.value) {
    error.value = 'Sélectionnez d’abord une personne.'
    return
  }
  form.value = {
    personId: person.value.id,
    type: 'BAPTISM',
    celebrationDate: '',
    celebrantName: '',
    place: '',
    registerNumber: '',
    certificateNumber: '',
    notes: '',
  }
  error.value = ''
  showNewAct.value = true
}

async function createAct() {
  if (!form.value.personId || !form.value.celebrationDate) {
    error.value = 'Sélectionnez une personne et renseignez la date du sacrement.'
    return
  }

  try {
    await sacramentalApi.create(form.value)
    showNewAct.value = false
    error.value = ''
    await load()
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
      <p class="mt-2 max-w-3xl text-[13.5px] leading-5 text-[#4A443E]">Le registre est un document canonique : on n'y efface rien. Un acte erroné se corrige par annotation datée et signée, visible sous l'acte d'origine.</p>
    </div>

    <div v-if="error" class="mb-3 rounded-[5px] border border-[#B3261E] bg-[#FBE9E8] p-3 text-[13.5px] text-[#7A1B16]">
      {{ error }}
    </div>

    <div class="overflow-hidden rounded-[6px] border border-[#C2BAB0] bg-[#F7F5F2]">
      <header class="flex flex-col gap-3 border-b border-[#DDD7CF] bg-white px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <div>
          <h2 class="text-[20px] font-bold text-[#2E2925]">Registre sacramentel</h2>
          <p class="text-[13.5px] text-[#6B655D]">{{ acts.length }} actes chargés · données réelles de la paroisse</p>
        </div>
        <div class="flex flex-1 justify-end gap-2">
          <label class="flex min-h-9 w-full max-w-[300px] items-center gap-2 rounded-[5px] border-[1.5px] border-[#C2BAB0] bg-white px-2.5">
            <Search class="size-4 text-[#6B655D]" />
            <input v-model="query" @input="load" class="min-w-0 flex-1 border-0 bg-transparent text-[14px] outline-none" placeholder="Rechercher un nom" />
            <button v-if="query" type="button" @click="query=''; load()" class="text-[#6B655D]"><X class="size-3.5" /></button>
          </label>
          <button type="button" @click="openNewAct" class="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-[5px] bg-[#14345E] px-3.5 text-[13.5px] font-bold text-white hover:bg-[#0E2A4E]">
            <Plus class="size-4" /> Nouvel acte
          </button>
        </div>
      </header>

      <div class="grid min-w-0 xl:grid-cols-[296px_minmax(0,1fr)_400px]">
        <aside class="border-b border-[#EDE9E4] bg-white xl:border-b-0 xl:border-r">
          <div class="border-b border-[#EDE9E4] px-3.5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#6B655D]">
            {{ filtered.length }} {{ query ? 'résultat(s) pour « ' + query + ' »' : 'personne(s) disponibles' }}
          </div>
          <button v-for="(item,index) in filtered" :key="item.id" @click="selected=index" class="block min-h-14 w-full border-b border-[#EDE9E4] px-3.5 py-2.5 text-left" :class="selected===index ? 'border-l-[3px] border-l-[#14345E] bg-[#E8EDF5]' : 'bg-white'">
            <div class="text-[15px] font-semibold" :class="selected===index ? 'text-[#14345E]' : 'text-[#2E2925]'">{{ item.name }}</div>
            <div class="text-[13px] text-[#6B655D]">{{ item.birth }}</div>
          </button>
          <div v-if="!filtered.length" class="p-4 text-[13.5px] text-[#6B655D]">Aucune personne trouvée.</div>
        </aside>

        <main class="min-w-0 space-y-3 p-4 sm:p-[16px_18px]">
          <div v-if="person" class="flex items-center gap-3 rounded-[5px] border border-[#EDE9E4] bg-white p-3.5">
            <div class="grid size-[52px] shrink-0 place-items-center rounded-full bg-[#14345E] text-[18px] font-bold text-white">{{ person.name.split(' ').map(n=>n[0]).join('').slice(0,2) }}</div>
            <div class="min-w-0 flex-1">
              <div class="text-[20px] font-bold text-[#2E2925]">{{ person.name }}</div>
              <div class="text-[13.5px] text-[#4A443E]">{{ person.birth }}</div>
            </div>
            <div class="hidden text-right sm:block">
              <div class="text-[12.5px] text-[#6B655D]">Actes enregistrés</div>
              <div class="text-[14px] font-bold text-[#2E2925]">{{ selectedActs.length }}</div>
            </div>
          </div>

          <div v-else class="rounded-[5px] border border-[#EDE9E4] bg-white p-5 text-[14px] text-[#6B655D]">
            Sélectionnez une personne dans la liste.
          </div>

          <div class="overflow-hidden rounded-[5px] border border-[#EDE9E4] bg-white">
            <div class="flex flex-col gap-1 border-b border-[#EDE9E4] px-3.5 py-2.5 sm:flex-row sm:items-center">
              <div class="text-[15px] font-bold text-[#2E2925]">Sacrements reçus</div>
              <div class="text-[13px] text-[#6B655D] sm:ml-auto">Actes réellement enregistrés</div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[620px] text-[14px]">
                <thead class="bg-[#FBFAF8] text-left text-[11.5px] uppercase tracking-[0.05em] text-[#6B655D]"><tr><th class="px-3.5 py-2.5">Sacrement</th><th class="px-3.5 py-2.5">Date</th><th class="px-3.5 py-2.5">Registre</th><th class="px-3.5 py-2.5">Certificat</th></tr></thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.id" class="border-t border-[#EDE9E4]">
                    <td class="px-3.5 py-3 font-semibold text-[#2E2925]">{{ sacramentLabel(row.s) }}</td>
                    <td class="px-3.5 py-3 whitespace-nowrap">{{ row.d }}</td>
                    <td class="px-3.5 py-3 text-[13px]">{{ row.r }}</td>
                    <td class="px-3.5 py-3 font-semibold text-[#A84A28]">{{ row.c }}</td>
                  </tr>
                  <tr v-if="!rows.length"><td colspan="4" class="px-3.5 py-6 text-center text-[13.5px] text-[#6B655D]">Aucun acte sacramentel enregistré pour cette personne.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <aside class="border-t border-[#EDE9E4] bg-white p-4 xl:border-l xl:border-t-0">
          <div class="mb-2.5 text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#A84A28]">Aperçu avant impression</div>
          <div v-if="person && selectedAct" class="rounded-[5px] bg-[#F7F5F2] p-3.5">
            <div class="bg-white p-5 shadow-sm">
              <div class="border-b border-[#DDD7CF] pb-2 text-center">
                <div class="text-[10.5px] uppercase tracking-[0.12em] text-[#6B655D]">Archidiocèse d'Abidjan</div>
                <div class="text-[12.5px] font-semibold text-[#2E2925]">Paroisse</div>
              </div>
              <div class="py-3 text-center text-[16px] font-bold text-[#14345E]">CERTIFICAT DE {{ sacramentLabel(selectedAct.type).toUpperCase() }}</div>
              <p class="text-[12.5px] leading-[1.7] text-[#2E2925]">Je soussigné, curé de la paroisse, certifie qu'il résulte du registre sacramentel que :</p>
              <div class="my-2 border-l-2 border-[#C25A34] pl-2.5 text-[12.5px] leading-[1.7]">
                <strong>{{ person.name.toUpperCase() }}</strong><br>
                {{ person.birth }}<br>
                {{ sacramentLabel(selectedAct.type) }} célébré(e) le {{ new Date(selectedAct.celebrationDate).toLocaleDateString('fr-FR') }}.<br>
                <span v-if="selectedAct.place">Lieu : {{ selectedAct.place }}.<br></span>
                <span v-if="selectedAct.celebrantName">Célébrant : {{ selectedAct.celebrantName }}.<br></span>
                <span v-if="selectedAct.registerNumber">Registre : {{ selectedAct.registerNumber }}.</span>
              </div>
              <div class="mt-4 text-[11px] text-[#6B655D]">{{ new Date(selectedAct.celebrationDate).toLocaleDateString('fr-FR') }}</div>
            </div>
          </div>
          <div v-else class="rounded-[5px] bg-[#F7F5F2] p-5 text-[13.5px] leading-5 text-[#6B655D]">
            Sélectionnez une personne ayant au moins un acte enregistré pour afficher son aperçu officiel.
          </div>
          <div v-if="person && selectedAct" class="mt-3 rounded-[5px] border border-[#B3261E] bg-[#FBE9E8] p-3 text-[13.5px] leading-5 text-[#2E2925]">
            Document officiel numéroté. Les informations affichées proviennent de l'acte sélectionné dans le registre.
          </div>
        </aside>
      </div>
    </div>

    <div v-if="showNewAct" class="fixed inset-0 z-50 grid place-items-center bg-[#0B1F3A]/50 p-4" @click.self="showNewAct=false">
      <div class="w-full max-w-2xl overflow-hidden rounded-[6px] border border-[#C2BAB0] bg-white shadow-xl">
        <div class="border-b border-[#EDE9E4] p-4">
          <h2 class="text-[19px] font-bold text-[#2E2925]">Inscrire un acte</h2>
          <p class="text-[13.5px] text-[#6B655D]">Personne sélectionnée : {{ person?.name }}</p>
        </div>
        <div class="flex gap-2 border-b border-[#B3261E] bg-[#FBE9E8] p-3 text-[13.5px] leading-5">
          <AlertTriangle class="size-5 shrink-0 text-[#B3261E]" />
          <span><strong class="text-[#B3261E]">Un acte inscrit ne peut plus être supprimé.</strong> Vérifiez chaque champ avant inscription.</span>
        </div>
        <div class="grid gap-3 p-4 sm:grid-cols-2">
          <label class="text-[13.5px] font-semibold">Personne sélectionnée
            <input :value="person?.name || ''" readonly class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] bg-[#F7F5F2] px-3 font-normal" />
          </label>
          <label class="text-[13.5px] font-semibold">Sacrement
            <select v-model="form.type" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] bg-white px-3 font-normal">
              <option value="BAPTISM">Baptême</option>
              <option value="CONFIRMATION">Confirmation</option>
              <option value="FIRST_COMMUNION">Première communion</option>
              <option value="MARRIAGE">Mariage</option>
              <option value="ORDINATION">Ordination</option>
              <option value="ANOINTING">Onction des malades</option>
              <option value="RECONCILIATION">Réconciliation</option>
            </select>
          </label>
          <label class="text-[13.5px] font-semibold">Date du sacrement
            <input v-model="form.celebrationDate" type="date" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" />
          </label>
          <label class="text-[13.5px] font-semibold">Ministre
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
