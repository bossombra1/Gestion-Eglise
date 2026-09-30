<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AlertTriangle, CalendarDays, Check, Plus, Save, X } from 'lucide-vue-next'
import { bannsApi, type MarriageCase, type MarriageDocumentStatus } from '@/services/administration-banns.service'

type Couple = MarriageCase

const couples = ref<Couple[]>([])
const selected = ref<Couple | null>(null)
const showNew = ref(false)
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const newForm = ref({
  groomName: '',
  brideName: '',
  groomBirthDate: '',
  brideBirthDate: '',
  groomPhone: '',
  bridePhone: '',
  groomAddress: '',
  brideAddress: '',
  celebrationDate: '',
  celebrationTime: '10:00',
  celebrantName: '',
  groomBaptismStatus: 'PENDING' as MarriageDocumentStatus,
  brideBaptismStatus: 'PENDING' as MarriageDocumentStatus,
  groomConfirmationStatus: 'PENDING' as MarriageDocumentStatus,
  brideConfirmationStatus: 'PENDING' as MarriageDocumentStatus,
  preparationStatus: 'PENDING' as MarriageDocumentStatus,
  civilStatusStatus: 'PENDING' as MarriageDocumentStatus,
  publication1Date: '',
  publication2Date: '',
  publication3Date: '',
  oppositionCount: 0,
  oppositionNote: '',
  notes: '',
})

const formatDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : '—'

const formatDateInput = (value: string | null | undefined) => value ? value.slice(0, 10) : ''

const publicationDates = (item: Couple) => [
  item.publication1Date,
  item.publication2Date,
  item.publication3Date,
]

const publicationCount = (item: Couple) =>
  publicationDates(item).filter(Boolean).length || item.publicationCount

const publicationText = (item: Couple) => {
  const count = publicationCount(item)
  if (!count) return 'Non commencée'
  if (item.oppositionCount > 0) return count + ' / 3 publiée(s) · ' + item.oppositionCount + ' opposition(s)'
  if (count === 3) return '3 / 3 publiées · aucune opposition'
  const next = publicationDates(item).findIndex(v => !v)
  return count + ' / 3 · prochaine publication à renseigner'
}

const statusLabel = (status: MarriageDocumentStatus) => ({
  COMPLETE: 'Complet',
  ISSUE: 'À corriger',
  PENDING: 'À renseigner',
}[status])

const statusClass = (status: MarriageDocumentStatus) => ({
  COMPLETE: 'bg-[#E4F1E8] text-[#14713C]',
  ISSUE: 'bg-[#FBE9E8] text-[#B3261E]',
  PENDING: 'bg-[#FDF3DC] text-[#8A5200]',
}[status])

const documents = (item: Couple) => [
  { label: 'Baptême époux', status: item.groomBaptismStatus },
  { label: 'Baptême épouse', status: item.brideBaptismStatus },
  { label: 'Confirmation époux', status: item.groomConfirmationStatus },
  { label: 'Confirmation épouse', status: item.brideConfirmationStatus },
  { label: 'Préparation', status: item.preparationStatus },
  { label: 'État civil', status: item.civilStatusStatus },
]

const totalCases = computed(() => couples.value.length)
const publicationsToComplete = computed(() => couples.value.filter(item => publicationCount(item) < 3).length)

async function load() {
  loading.value = true
  error.value = ''
  try {
    couples.value = await bannsApi.list()
  } catch {
    error.value = 'Impossible de charger les dossiers de mariage.'
  } finally {
    loading.value = false
  }
}

function resetNewForm() {
  Object.assign(newForm.value, {
    groomName: '', brideName: '', groomBirthDate: '', brideBirthDate: '',
    groomPhone: '', bridePhone: '', groomAddress: '', brideAddress: '',
    celebrationDate: '', celebrationTime: '10:00', celebrantName: '',
    groomBaptismStatus: 'PENDING', brideBaptismStatus: 'PENDING',
    groomConfirmationStatus: 'PENDING', brideConfirmationStatus: 'PENDING',
    preparationStatus: 'PENDING', civilStatusStatus: 'PENDING',
    publication1Date: '', publication2Date: '', publication3Date: '',
    oppositionCount: 0, oppositionNote: '', notes: '',
  })
}

function openNew() {
  resetNewForm()
  showNew.value = true
  error.value = ''
}

async function createCase() {
  if (!newForm.value.groomName.trim() || !newForm.value.brideName.trim() || !newForm.value.celebrationDate) {
    error.value = 'Les noms des fiancés et la date de célébration sont obligatoires.'
    return
  }

  saving.value = true
  error.value = ''
  try {
    await bannsApi.create({
      ...newForm.value,
      groomName: newForm.value.groomName.trim(),
      brideName: newForm.value.brideName.trim(),
      groomBirthDate: newForm.value.groomBirthDate || undefined,
      brideBirthDate: newForm.value.brideBirthDate || undefined,
      publication1Date: newForm.value.publication1Date || undefined,
      publication2Date: newForm.value.publication2Date || undefined,
      publication3Date: newForm.value.publication3Date || undefined,
      publicationCount: [newForm.value.publication1Date, newForm.value.publication2Date, newForm.value.publication3Date].filter(Boolean).length,
      status: 'DRAFT',
    })
    showNew.value = false
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Impossible de créer le dossier.'
  } finally {
    saving.value = false
  }
}

function openCase(item: Couple) {
  selected.value = structuredClone(item)
  error.value = ''
}

function closeCase() {
  selected.value = null
}

async function saveCase() {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  try {
    const count = publicationCount(selected.value)
    const status = selected.value.status === 'CANCELLED'
      ? 'CANCELLED'
      : count >= 3 ? 'PUBLISHED' : selected.value.status === 'PUBLISHED' ? 'READY' : selected.value.status

    await bannsApi.update(selected.value.id, {
      groomName: selected.value.groomName,
      brideName: selected.value.brideName,
      groomBirthDate: selected.value.groomBirthDate || null,
      brideBirthDate: selected.value.brideBirthDate || null,
      groomPhone: selected.value.groomPhone || null,
      bridePhone: selected.value.bridePhone || null,
      groomAddress: selected.value.groomAddress || null,
      brideAddress: selected.value.brideAddress || null,
      celebrationDate: selected.value.celebrationDate,
      celebrationTime: selected.value.celebrationTime || null,
      celebrantName: selected.value.celebrantName || null,
      groomBaptismStatus: selected.value.groomBaptismStatus,
      brideBaptismStatus: selected.value.brideBaptismStatus,
      groomConfirmationStatus: selected.value.groomConfirmationStatus,
      brideConfirmationStatus: selected.value.brideConfirmationStatus,
      preparationStatus: selected.value.preparationStatus,
      civilStatusStatus: selected.value.civilStatusStatus,
      groomDocuments: documents(selected.value).filter(d => d.status === 'COMPLETE' && d.label.includes('époux')).length,
      brideDocuments: documents(selected.value).filter(d => d.status === 'COMPLETE' && d.label.includes('épouse')).length,
      publicationCount: count,
      publication1Date: selected.value.publication1Date || null,
      publication2Date: selected.value.publication2Date || null,
      publication3Date: selected.value.publication3Date || null,
      oppositionCount: Number(selected.value.oppositionCount || 0),
      oppositionNote: selected.value.oppositionNote || null,
      notes: selected.value.notes || null,
      status,
    })
    selected.value = null
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Impossible d’enregistrer le dossier.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="space-y-5">
    <div class="flex items-baseline gap-4 border-b border-[#C2BAB0] pb-2">
      <span class="text-[42px] leading-none text-[#C25A34]">05</span>
      <div>
        <h1 class="font-serif text-[32px] leading-tight text-[#2E2925]">Bans de mariage</h1>
        <p class="mt-1 max-w-4xl text-sm leading-6 text-[#6B655D]">
          Suivi des dossiers, des pièces nécessaires et des publications des bans jusqu'à la célébration.
        </p>
      </div>
    </div>

    <div class="overflow-hidden rounded-md border border-[#C2BAB0] bg-white">
      <div class="flex flex-wrap items-center gap-4 border-b border-[#DDD7CF] px-5 py-3">
        <div>
          <div class="text-xl font-bold text-[#2E2925]">Bans de mariage</div>
          <div class="text-[13.5px] text-[#6B655D]">
            {{ totalCases }} dossier(s) · {{ publicationsToComplete }} dossier(s) avec des publications à compléter
          </div>
        </div>
        <button
          type="button"
          class="ml-auto inline-flex min-h-[38px] items-center gap-2 rounded bg-[#14345E] px-4 text-sm font-bold text-white transition hover:bg-[#0E2A4E]"
          @click="openNew"
        >
          <Plus :size="17" /> Ouvrir un dossier
        </button>
      </div>

      <div v-if="error && !selected && !showNew" class="m-4 rounded border border-[#B3261E]/30 bg-[#FFF5F4] p-3 text-sm text-[#B3261E]">{{ error }}</div>

      <div v-if="loading" class="p-12 text-center text-sm text-[#6B655D]">Chargement des dossiers…</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[1180px] text-[14px]">
          <thead class="bg-[#F7F5F2] text-left text-xs font-bold uppercase tracking-[0.05em] text-[#6B655D]">
            <tr>
              <th class="px-4 py-3">Fiancés</th>
              <th class="w-[150px] px-3 py-3">Célébration</th>
              <th class="w-[350px] px-3 py-3">Pièces requises</th>
              <th class="w-[240px] px-3 py-3">Publication des bans</th>
              <th class="w-[150px] px-3 py-3">Célébrant</th>
              <th class="w-[100px] px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in couples" :key="item.id" class="border-t border-[#EDE9E4] align-top hover:bg-[#FCFBFA]">
              <td class="px-4 py-4">
                <div class="font-semibold text-[#2E2925]">{{ item.groomName }}</div>
                <div class="text-[13.5px] text-[#6B655D]">et {{ item.brideName }}</div>
              </td>
              <td class="px-3 py-4 tabular-nums">
                {{ formatDate(item.celebrationDate) }}
                <div class="text-[13px] text-[#6B655D]">{{ item.celebrationTime || 'Heure à définir' }}</div>
              </td>
              <td class="px-3 py-4">
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="doc in documents(item)" :key="doc.label" class="rounded-xl px-2 py-0.5 text-[12px] font-semibold" :class="statusClass(doc.status)">
                    {{ doc.label }} · {{ statusLabel(doc.status) }}
                  </span>
                </div>
              </td>
              <td class="px-3 py-4">
                <div class="mb-1.5 flex gap-1">
                  <span v-for="n in 3" :key="n" class="h-2 w-[30px] rounded" :class="n <= publicationCount(item) ? 'bg-[#14713C]' : 'bg-[#EDE9E4]'" />
                </div>
                <div class="text-[13px] font-semibold" :class="publicationCount(item) === 3 ? 'text-[#14713C]' : publicationCount(item) ? 'text-[#8A5200]' : 'text-[#6B655D]'">
                  {{ publicationText(item) }}
                </div>
                <div v-if="item.publication1Date || item.publication2Date || item.publication3Date" class="mt-1 text-[12px] text-[#6B655D]">
                  <span v-if="item.publication1Date">1 : {{ formatDate(item.publication1Date) }}</span>
                  <span v-if="item.publication2Date"> · 2 : {{ formatDate(item.publication2Date) }}</span>
                  <span v-if="item.publication3Date"> · 3 : {{ formatDate(item.publication3Date) }}</span>
                </div>
              </td>
              <td class="px-3 py-4">
                <span :class="item.celebrantName ? 'text-[#2E2925]' : 'font-semibold text-[#8A5200]'">
                  {{ item.celebrantName || 'À définir' }}
                </span>
              </td>
              <td class="px-3 py-4">
                <button type="button" class="font-semibold text-[#A84A28] hover:underline" @click="openCase(item)">
                  Ouvrir
                </button>
              </td>
            </tr>
            <tr v-if="!couples.length">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-[#6B655D]">Aucun dossier de mariage enregistré.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-start gap-2.5 border-t border-[#EDE9E4] bg-[#FDF3DC] px-4 py-3 text-[13.5px] leading-5 text-[#2E2925]">
        <CalendarDays :size="19" class="mt-0.5 shrink-0 text-[#8A5200]" />
        <div>
          <strong>Publication des bans :</strong> dans cette vue, une publication est une date réellement renseignée pour une lecture/affichage du ban.
          Les trois étapes sont suivies séparément afin de savoir ce qui a déjà été publié et ce qui reste à faire.
          Les règles et le nombre de publications applicables à la paroisse doivent être confirmés par le responsable avant validation finale.
        </div>
      </div>
    </div>

    <div v-if="selected" class="fixed inset-0 z-50 grid place-items-center bg-[#0B1F3A]/45 p-4" @click.self="closeCase">
      <div class="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-md border border-[#C2BAB0] bg-white shadow-xl">
        <div class="sticky top-0 z-10 flex items-start justify-between border-b border-[#DDD7CF] bg-white p-5">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.12em] text-[#C25A34]">Dossier de mariage</p>
            <h2 class="mt-1 font-serif text-2xl text-[#2E2925]">{{ selected.groomName }} et {{ selected.brideName }}</h2>
            <p class="mt-1 text-sm text-[#6B655D]">{{ formatDate(selected.celebrationDate) }} · {{ selected.celebrationTime || 'Heure à définir' }}</p>
          </div>
          <button type="button" class="rounded p-1 text-[#6B655D] hover:bg-[#F7F5F2]" @click="closeCase"><X :size="20" /></button>
        </div>

        <div class="grid gap-6 p-5">
          <section>
            <h3 class="text-sm font-bold uppercase tracking-wide text-[#6B655D]">Informations des fiancés</h3>
            <div class="mt-3 grid gap-4 md:grid-cols-2">
              <div class="rounded border border-[#EDE9E4] p-4">
                <h4 class="font-bold text-[#2E2925]">Époux</h4>
                <div class="mt-3 grid gap-3">
                  <label class="text-sm font-semibold">Nom et prénoms<input v-model="selected.groomName" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal outline-none focus:border-[#14345E]" /></label>
                  <label class="text-sm font-semibold">Date de naissance<input v-model="selected.groomBirthDate" type="date" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal outline-none focus:border-[#14345E]" /></label>
                  <label class="text-sm font-semibold">Téléphone<input v-model="selected.groomPhone" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal outline-none focus:border-[#14345E]" /></label>
                  <label class="text-sm font-semibold">Adresse<textarea v-model="selected.groomAddress" rows="2" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal outline-none focus:border-[#14345E]" /></label>
                </div>
              </div>
              <div class="rounded border border-[#EDE9E4] p-4">
                <h4 class="font-bold text-[#2E2925]">Épouse</h4>
                <div class="mt-3 grid gap-3">
                  <label class="text-sm font-semibold">Nom et prénoms<input v-model="selected.brideName" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal outline-none focus:border-[#14345E]" /></label>
                  <label class="text-sm font-semibold">Date de naissance<input v-model="selected.brideBirthDate" type="date" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal outline-none focus:border-[#14345E]" /></label>
                  <label class="text-sm font-semibold">Téléphone<input v-model="selected.bridePhone" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal outline-none focus:border-[#14345E]" /></label>
                  <label class="text-sm font-semibold">Adresse<textarea v-model="selected.brideAddress" rows="2" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal outline-none focus:border-[#14345E]" /></label>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-sm font-bold uppercase tracking-wide text-[#6B655D]">Célébration</h3>
            <div class="mt-3 grid gap-4 md:grid-cols-3">
              <label class="text-sm font-semibold">Date<input v-model="selected.celebrationDate" type="date" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal" /></label>
              <label class="text-sm font-semibold">Heure<input v-model="selected.celebrationTime" type="time" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal" /></label>
              <label class="text-sm font-semibold">Célébrant<input v-model="selected.celebrantName" placeholder="À définir si non attribué" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal" /></label>
            </div>
          </section>

          <section>
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-bold uppercase tracking-wide text-[#6B655D]">Pièces requises</h3>
                <p class="mt-1 text-xs text-[#6B655D]">Renseignez l'état réel de chaque élément du dossier.</p>
              </div>
            </div>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <label class="flex items-center justify-between gap-3 rounded border border-[#EDE9E4] p-3 text-sm font-semibold">
                Baptême époux
                <select v-model="selected.groomBaptismStatus" class="rounded border border-[#C2BAB0] px-2 py-1 font-normal">
                  <option value="PENDING">À renseigner</option><option value="COMPLETE">Complet</option><option value="ISSUE">À corriger</option>
                </select>
              </label>
              <label class="flex items-center justify-between gap-3 rounded border border-[#EDE9E4] p-3 text-sm font-semibold">
                Baptême épouse
                <select v-model="selected.brideBaptismStatus" class="rounded border border-[#C2BAB0] px-2 py-1 font-normal">
                  <option value="PENDING">À renseigner</option><option value="COMPLETE">Complet</option><option value="ISSUE">À corriger</option>
                </select>
              </label>
              <label class="flex items-center justify-between gap-3 rounded border border-[#EDE9E4] p-3 text-sm font-semibold">
                Confirmation époux
                <select v-model="selected.groomConfirmationStatus" class="rounded border border-[#C2BAB0] px-2 py-1 font-normal">
                  <option value="PENDING">À renseigner</option><option value="COMPLETE">Complet</option><option value="ISSUE">À corriger</option>
                </select>
              </label>
              <label class="flex items-center justify-between gap-3 rounded border border-[#EDE9E4] p-3 text-sm font-semibold">
                Confirmation épouse
                <select v-model="selected.brideConfirmationStatus" class="rounded border border-[#C2BAB0] px-2 py-1 font-normal">
                  <option value="PENDING">À renseigner</option><option value="COMPLETE">Complet</option><option value="ISSUE">À corriger</option>
                </select>
              </label>
              <label class="flex items-center justify-between gap-3 rounded border border-[#EDE9E4] p-3 text-sm font-semibold">
                Préparation
                <select v-model="selected.preparationStatus" class="rounded border border-[#C2BAB0] px-2 py-1 font-normal">
                  <option value="PENDING">À renseigner</option><option value="COMPLETE">Complet</option><option value="ISSUE">À corriger</option>
                </select>
              </label>
              <label class="flex items-center justify-between gap-3 rounded border border-[#EDE9E4] p-3 text-sm font-semibold">
                État civil
                <select v-model="selected.civilStatusStatus" class="rounded border border-[#C2BAB0] px-2 py-1 font-normal">
                  <option value="PENDING">À renseigner</option><option value="COMPLETE">Complet</option><option value="ISSUE">À corriger</option>
                </select>
              </label>
            </div>
          </section>

          <section class="rounded border border-[#EDE9E4] p-4">
            <h3 class="text-sm font-bold uppercase tracking-wide text-[#6B655D]">Publication des bans</h3>
            <p class="mt-1 text-xs leading-5 text-[#6B655D]">
              Chaque date correspond à une publication réellement effectuée. Ne renseignez une date qu'après la lecture ou l'affichage effectif du ban.
            </p>
            <div class="mt-4 grid gap-4 md:grid-cols-3">
              <label v-for="(key, index) in ['publication1Date', 'publication2Date', 'publication3Date']" :key="key" class="text-sm font-semibold">
                Publication {{ index + 1 }}
                <input v-model="selected[key as 'publication1Date' | 'publication2Date' | 'publication3Date']" type="date" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal" />
              </label>
            </div>
            <div class="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
              <label class="text-sm font-semibold">Oppositions
                <input v-model.number="selected.oppositionCount" min="0" type="number" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal" />
              </label>
              <label class="text-sm font-semibold">Observation / opposition
                <input v-model="selected.oppositionNote" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal" placeholder="Laisser vide s'il n'y en a pas" />
              </label>
            </div>
            <div class="mt-4 flex gap-2 rounded bg-[#FDF3DC] p-3 text-sm leading-5 text-[#2E2925]">
              <AlertTriangle class="mt-0.5 size-4 shrink-0 text-[#8A5200]" />
              L'application ne considère pas une publication comme effectuée simplement parce qu'une date est prévue : la date doit être saisie après réalisation.
            </div>
          </section>

          <section>
            <label class="text-sm font-semibold">Notes internes
              <textarea v-model="selected.notes" rows="3" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal" placeholder="Informations utiles au suivi du dossier" />
            </label>
          </section>
        </div>

        <div class="flex justify-end gap-2 border-t border-[#DDD7CF] bg-[#F7F5F2] p-4">
          <button type="button" class="rounded border border-[#C2BAB0] bg-white px-4 py-2 text-sm font-semibold text-[#2E2925]" @click="closeCase">Annuler</button>
          <button type="button" :disabled="saving" class="inline-flex items-center gap-2 rounded bg-[#14345E] px-4 py-2 text-sm font-bold text-white disabled:opacity-50" @click="saveCase">
            <Save :size="16" /> {{ saving ? 'Enregistrement…' : 'Enregistrer le dossier' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showNew" class="fixed inset-0 z-50 grid place-items-center bg-[#0B1F3A]/45 p-4" @click.self="showNew = false">
      <form class="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-md border border-[#C2BAB0] bg-white shadow-xl" @submit.prevent="createCase">
        <div class="sticky top-0 z-10 flex items-start justify-between border-b border-[#DDD7CF] bg-white p-5">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.12em] text-[#C25A34]">Nouveau dossier</p>
            <h2 class="mt-1 font-serif text-2xl text-[#2E2925]">Ouvrir un dossier de mariage</h2>
            <p class="mt-1 text-sm text-[#6B655D]">Renseignez les informations connues. Les pièces et publications pourront être complétées ensuite.</p>
          </div>
          <button type="button" class="rounded p-1 text-[#6B655D]" @click="showNew = false"><X :size="20" /></button>
        </div>

        <div class="space-y-6 p-5">
          <div v-if="error" class="rounded border border-[#B3261E]/30 bg-[#FFF5F4] p-3 text-sm text-[#B3261E]">{{ error }}</div>

          <section>
            <h3 class="text-sm font-bold uppercase tracking-wide text-[#6B655D]">Fiancés</h3>
            <div class="mt-3 grid gap-4 md:grid-cols-2">
              <div class="rounded border border-[#EDE9E4] p-4">
                <h4 class="font-bold text-[#2E2925]">Époux</h4>
                <div class="mt-3 grid gap-3">
                  <label class="text-sm font-semibold">Nom et prénoms *
                    <input v-model="newForm.groomName" required class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" placeholder="Nom et prénoms" />
                  </label>
                  <label class="text-sm font-semibold">Date de naissance
                    <input v-model="newForm.groomBirthDate" type="date" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" />
                  </label>
                  <label class="text-sm font-semibold">Téléphone
                    <input v-model="newForm.groomPhone" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" />
                  </label>
                  <label class="text-sm font-semibold">Adresse
                    <textarea v-model="newForm.groomAddress" rows="2" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" />
                  </label>
                </div>
              </div>
              <div class="rounded border border-[#EDE9E4] p-4">
                <h4 class="font-bold text-[#2E2925]">Épouse</h4>
                <div class="mt-3 grid gap-3">
                  <label class="text-sm font-semibold">Nom et prénoms *
                    <input v-model="newForm.brideName" required class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" placeholder="Nom et prénoms" />
                  </label>
                  <label class="text-sm font-semibold">Date de naissance
                    <input v-model="newForm.brideBirthDate" type="date" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" />
                  </label>
                  <label class="text-sm font-semibold">Téléphone
                    <input v-model="newForm.bridePhone" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" />
                  </label>
                  <label class="text-sm font-semibold">Adresse
                    <textarea v-model="newForm.brideAddress" rows="2" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-sm font-bold uppercase tracking-wide text-[#6B655D]">Célébration</h3>
            <div class="mt-3 grid gap-4 md:grid-cols-3">
              <label class="text-sm font-semibold">Date *
                <input v-model="newForm.celebrationDate" required type="date" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" />
              </label>
              <label class="text-sm font-semibold">Heure
                <input v-model="newForm.celebrationTime" type="time" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" />
              </label>
              <label class="text-sm font-semibold">Célébrant
                <input v-model="newForm.celebrantName" placeholder="À définir si non attribué" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal" />
              </label>
            </div>
          </section>

          <section>
            <h3 class="text-sm font-bold uppercase tracking-wide text-[#6B655D]">Suivi initial des pièces</h3>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <label v-for="field in [
                ['groomBaptismStatus', 'Baptême époux'], ['brideBaptismStatus', 'Baptême épouse'],
                ['groomConfirmationStatus', 'Confirmation époux'], ['brideConfirmationStatus', 'Confirmation épouse'],
                ['preparationStatus', 'Préparation'], ['civilStatusStatus', 'État civil']
              ]" :key="field[0]" class="flex items-center justify-between gap-3 rounded border border-[#EDE9E4] p-3 text-sm font-semibold">
                {{ field[1] }}
                <select v-model="newForm[field[0] as keyof typeof newForm]" class="rounded border border-[#C2BAB0] px-2 py-1 font-normal">
                  <option value="PENDING">À renseigner</option>
                  <option value="COMPLETE">Complet</option>
                  <option value="ISSUE">À corriger</option>
                </select>
              </label>
            </div>
          </section>

          <section>
            <h3 class="text-sm font-bold uppercase tracking-wide text-[#6B655D]">Publication des bans</h3>
            <p class="mt-1 text-xs leading-5 text-[#6B655D]">Laissez les dates vides tant que les publications n'ont pas réellement eu lieu.</p>
            <div class="mt-3 grid gap-4 md:grid-cols-3">
              <label v-for="(key, index) in ['publication1Date', 'publication2Date', 'publication3Date']" :key="key" class="text-sm font-semibold">
                Publication {{ index + 1 }}
                <input v-model="newForm[key as 'publication1Date' | 'publication2Date' | 'publication3Date']" type="date" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal" />
              </label>
            </div>
          </section>

          <section>
            <label class="text-sm font-semibold">Notes
              <textarea v-model="newForm.notes" rows="3" class="mt-1 w-full rounded border border-[#C2BAB0] px-3 py-2 font-normal" placeholder="Informations utiles au suivi" />
            </label>
          </section>
        </div>

        <div class="flex justify-end gap-2 border-t border-[#DDD7CF] bg-[#F7F5F2] p-4">
          <button type="button" class="rounded border border-[#C2BAB0] bg-white px-4 py-2 text-sm font-semibold" @click="showNew = false">Annuler</button>
          <button type="submit" :disabled="saving" class="inline-flex items-center gap-2 rounded bg-[#14345E] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            <Plus :size="16" /> {{ saving ? 'Création…' : 'Créer le dossier' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
