<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, CalendarDays, Check, Plus, X } from 'lucide-vue-next'

type Status = 'complete' | 'progress' | 'pending'
type Couple = {
  groom: string
  bride: string
  date: string
  time: string
  documents: { label: string; status: Status }[]
  publications: number
  publicationNote: string
  celebrant: string
}

const couples = ref<Couple[]>([
  {
    groom: 'Kouamé Éric', bride: 'Assamoi Léa', date: 'Sam. 24 oct.', time: '10 h 00',
    documents: [
      { label: 'Baptêmes', status: 'complete' }, { label: 'Confirmations', status: 'complete' },
      { label: 'Préparation', status: 'complete' }, { label: 'État civil', status: 'complete' },
    ], publications: 3, publicationNote: '3 / 3 publiées · aucune opposition', celebrant: 'P. Konan',
  },
  {
    groom: 'Gnahoré Franck', bride: 'Bamba Rachelle', date: 'Sam. 7 nov.', time: '10 h 00',
    documents: [
      { label: 'Baptêmes', status: 'complete' }, { label: 'Confirmation ép.', status: 'progress' },
      { label: 'Préparation', status: 'complete' }, { label: 'État civil', status: 'complete' },
    ], publications: 2, publicationNote: '2 / 3 · 3ᵉ le dim. 7 sept.', celebrant: 'P. Kouamé',
  },
  {
    groom: 'Yao Christian', bride: 'Diomandé Nadia', date: 'Sam. 21 nov.', time: '10 h 00',
    documents: [
      { label: 'Baptêmes', status: 'complete' }, { label: 'Confirmations', status: 'complete' },
      { label: 'Préparation à faire', status: 'pending' }, { label: 'État civil', status: 'progress' },
    ], publications: 1, publicationNote: '1 / 3 · à publier dim. 7 sept.', celebrant: 'P. Konan',
  },
  {
    groom: 'Koffi Landry', bride: 'Traoré Estelle', date: 'Sam. 12 déc.', time: '10 h 00',
    documents: [
      { label: 'Baptêmes', status: 'complete' }, { label: 'Confirmations', status: 'progress' },
      { label: 'Préparation', status: 'progress' }, { label: 'État civil manquant', status: 'pending' },
    ], publications: 0, publicationNote: 'Non commencée', celebrant: 'À définir',
  },
  {
    groom: "N'Da Wilfried", bride: 'Aka Sylvie', date: 'Sam. 9 janv.', time: '10 h 00',
    documents: [
      { label: 'Baptême époux', status: 'progress' }, { label: 'Confirmations', status: 'progress' },
      { label: 'Préparation', status: 'progress' }, { label: 'État civil', status: 'progress' },
    ], publications: 0, publicationNote: 'Non commencée', celebrant: 'À définir',
  },
])

const selected = ref<Couple | null>(null)
const showNew = ref(false)
const newGroom = ref('')
const newBride = ref('')
const newDate = ref('')
const newTime = ref('10:00')

const openCase = (couple: Couple) => { selected.value = couple }
const closeCase = () => { selected.value = null }

const createCase = () => {
  if (!newGroom.value.trim() || !newBride.value.trim() || !newDate.value) return
  couples.value.unshift({
    groom: newGroom.value.trim(),
    bride: newBride.value.trim(),
    date: new Date(newDate.value + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', ''),
    time: newTime.value.replace(':', ' h '),
    documents: [
      { label: 'Baptêmes', status: 'progress' }, { label: 'Confirmations', status: 'progress' },
      { label: 'Préparation', status: 'progress' }, { label: 'État civil', status: 'progress' },
    ],
    publications: 0,
    publicationNote: 'Non commencée',
    celebrant: 'À définir',
  })
  newGroom.value = ''
  newBride.value = ''
  newDate.value = ''
  newTime.value = '10:00'
  showNew.value = false
}

const statusClass = (status: Status) => ({
  complete: 'bg-[#E4F1E8] text-[#14713C]',
  progress: 'bg-[#FDF3DC] text-[#8A5200]',
  pending: 'bg-[#FBE9E8] text-[#B3261E]',
}[status])

const publicationBars = computed(() => (couple: Couple) =>
  [1, 2, 3].map((n) => n <= couple.publications)
)
</script>

<template>
  <section class="space-y-5">
    <div class="flex items-baseline gap-4 border-b border-[#C2BAB0] pb-2">
      <span class="text-[42px] leading-none text-[#C25A34]">05</span>
      <div>
        <h1 class="font-serif text-[32px] leading-tight text-[#2E2925]">Bans de mariage</h1>
        <p class="mt-1 max-w-3xl text-sm leading-6 text-[#6B655D]">
          Un dossier de mariage se joue sur des délais : pièces à réunir, trois publications à afficher,
          et un célébrant disponible le jour dit. Les trois vivent sur le même écran.
        </p>
      </div>
    </div>

    <div class="overflow-hidden rounded-md border border-[#C2BAB0] bg-[#F7F5F2]">
      <div class="flex flex-wrap items-center gap-4 border-b border-[#DDD7CF] bg-white px-5 py-3">
        <div>
          <div class="text-xl font-bold text-[#2E2925]">Bans de mariage</div>
          <div class="text-[13.5px] text-[#6B655D]">5 dossiers en cours · 2 publications à afficher dimanche</div>
        </div>
        <button
          class="ml-auto inline-flex min-h-[38px] items-center gap-2 rounded bg-[#14345E] px-4 text-sm font-bold text-white transition hover:bg-[#0E2A4E]"
          @click="showNew = true"
        >
          <Plus :size="17" /> Ouvrir un dossier
        </button>
      </div>

      <div class="grid lg:grid-cols-[minmax(0,1fr)_396px]">
        <div class="min-w-0 overflow-x-auto bg-white lg:border-r lg:border-[#EDE9E4]">
          <table class="w-full min-w-[980px] text-[14px]">
            <thead class="bg-[#F7F5F2] text-left text-xs font-bold uppercase tracking-[0.05em] text-[#6B655D]">
              <tr>
                <th class="px-4 py-3">Fiancés</th>
                <th class="w-[124px] px-3 py-3">Célébration</th>
                <th class="w-[180px] px-3 py-3">Pièces requises</th>
                <th class="w-[188px] px-3 py-3">Publication des bans</th>
                <th class="w-[120px] px-3 py-3">Célébrant</th>
                <th class="w-[96px] px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="couple in couples" :key="couple.groom + couple.bride" class="border-t border-[#EDE9E4] align-top">
                <td class="px-4 py-3">
                  <div class="font-semibold text-[#2E2925]">{{ couple.groom }}</div>
                  <div class="text-[13.5px] text-[#6B655D]">et {{ couple.bride }}</div>
                </td>
                <td class="px-3 py-3 tabular-nums">
                  {{ couple.date }}<div class="text-[13px] text-[#6B655D]">{{ couple.time }}</div>
                </td>
                <td class="px-3 py-3">
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="doc in couple.documents" :key="doc.label" class="rounded-xl px-2 py-0.5 text-[12px] font-semibold" :class="statusClass(doc.status)">
                      {{ doc.label }}
                    </span>
                  </div>
                </td>
                <td class="px-3 py-3">
                  <div class="mb-1 flex gap-1">
                    <span v-for="(published, index) in publicationBars(couple)" :key="index" class="h-2 w-[22px] rounded" :class="published ? 'bg-[#14713C]' : 'bg-[#EDE9E4]'" />
                  </div>
                  <div class="text-[13px] font-semibold" :class="couple.publications === 3 ? 'text-[#14713C]' : couple.publications > 0 ? 'text-[#8A5200]' : 'text-[#6B655D]'">
                    {{ couple.publicationNote }}
                  </div>
                </td>
                <td class="px-3 py-3">
                  <span :class="couple.celebrant === 'À définir' ? 'font-semibold text-[#8A5200]' : 'text-[#2E2925]'">{{ couple.celebrant }}</span>
                </td>
                <td class="px-3 py-3">
                  <button class="font-semibold text-[#A84A28] hover:underline" @click="openCase(couple)">
                    {{ couple.publications === 3 ? 'Confirmer' : 'Ouvrir' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="flex items-start gap-2.5 border-t border-[#EDE9E4] bg-[#FDF3DC] px-4 py-3 text-[13.5px] leading-5 text-[#2E2925]">
            <CalendarDays :size="19" class="mt-0.5 shrink-0 text-[#8A5200]" />
            <div><strong>Dimanche 7 septembre :</strong> 2 bans à lire aux trois messes. La feuille de lecture s'imprime avec la feuille d'intentions.</div>
          </div>
        </div>

        <aside class="bg-white p-4">
          <div>
            <div class="text-[15.5px] font-bold text-[#2E2925]">Disponibilité des célébrants</div>
            <div class="text-[13.5px] text-[#6B655D]">Octobre 2026 · samedis de célébration</div>
          </div>
          <div class="mt-3 flex flex-wrap gap-3 text-xs text-[#4A443E]">
            <span class="inline-flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-sm bg-[#14345E]" />Mariage retenu</span>
            <span class="inline-flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-sm bg-[#C25A34]" />Autre engagement</span>
            <span class="inline-flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-sm border border-[#14713C] bg-[#E4F1E8]" />Libre</span>
          </div>

          <div class="mt-3 rounded border border-[#EDE9E4] p-3">
            <div class="mb-1.5 grid grid-cols-7 gap-1 text-center text-[11.5px] text-[#6B655D]">
              <div v-for="day in ['L','M','M','J','V','S','D']" :key="day + Math.random()">{{ day }}</div>
            </div>
            <div class="grid grid-cols-7 gap-1 text-center text-[13px] text-[#2E2925]">
              <template v-for="(day, index) in [28,29,30,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,1]" :key="index">
                <div class="rounded px-0 py-1.5" :class="{
                  'text-[#C2BAB0]': index < 3 || index === 35,
                  'bg-[#C25A34] font-bold text-white': index === 5,
                  'bg-[#14345E] font-bold text-white': [19, 26].includes(index),
                  'border border-[#14713C] bg-[#E4F1E8] font-semibold text-[#14713C]': [12, 33].includes(index)
                }">{{ day }}</div>
              </template>
            </div>
          </div>

          <div class="mt-3 grid gap-2">
            <div class="border border-[#EDE9E4] border-l-[3px] border-l-[#C25A34] rounded p-2.5">
              <div class="text-sm font-semibold text-[#2E2925]">Sam. 3 octobre · toute la journée</div>
              <div class="text-[13.5px] text-[#4A443E]">Pèlerinage diocésain — les deux prêtres absents</div>
            </div>
            <div class="border border-[#EDE9E4] border-l-[3px] border-l-[#14345E] rounded p-2.5">
              <div class="text-sm font-semibold text-[#2E2925]">Sam. 17 octobre · 10 h 00</div>
              <div class="text-[13.5px] text-[#4A443E]">Mariage Ouattara – Sanogo · P. Konan</div>
            </div>
            <div class="border border-[#EDE9E4] border-l-[3px] border-l-[#14345E] rounded p-2.5">
              <div class="text-sm font-semibold text-[#2E2925]">Sam. 24 octobre · 10 h 00</div>
              <div class="text-[13.5px] text-[#4A443E]">Mariage Kouamé – Assamoi · P. Konan</div>
            </div>
          </div>

          <div class="mt-3 flex items-start gap-2.5 rounded border border-[#B3261E] bg-[#FBE9E8] p-3">
            <AlertTriangle :size="18" class="mt-0.5 shrink-0 text-[#B3261E]" />
            <div class="text-[13.5px] leading-5 text-[#2E2925]">Deux mariages le même samedi demandent deux célébrants. Le 24 octobre n'en a qu'un de libre.</div>
          </div>
        </aside>
      </div>
    </div>

    <div v-if="selected" class="fixed inset-0 z-50 grid place-items-center bg-[#0B1F3A]/45 p-4" @click.self="closeCase">
      <div class="w-full max-w-2xl rounded-md border border-[#C2BAB0] bg-white shadow-xl">
        <div class="flex items-start justify-between border-b border-[#DDD7CF] p-5">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.12em] text-[#C25A34]">Dossier de mariage</p>
            <h2 class="mt-1 font-serif text-2xl text-[#2E2925]">{{ selected.groom }} et {{ selected.bride }}</h2>
            <p class="mt-1 text-sm text-[#6B655D]">{{ selected.date }} · {{ selected.time }}</p>
          </div>
          <button class="rounded p-1 text-[#6B655D] hover:bg-[#F7F5F2]" @click="closeCase"><X :size="20" /></button>
        </div>
        <div class="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <h3 class="text-sm font-bold text-[#2E2925]">Pièces requises</h3>
            <div class="mt-3 grid gap-2">
              <div v-for="doc in selected.documents" :key="doc.label" class="flex items-center gap-2 rounded border border-[#EDE9E4] p-2.5">
                <Check v-if="doc.status === 'complete'" :size="16" class="text-[#14713C]" />
                <AlertTriangle v-else :size="16" :class="doc.status === 'pending' ? 'text-[#B3261E]' : 'text-[#8A5200]'" />
                <span class="text-sm text-[#2E2925]">{{ doc.label }}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-bold text-[#2E2925]">Publications</h3>
            <div class="mt-3 rounded border border-[#EDE9E4] p-4">
              <div class="flex gap-2">
                <span v-for="n in 3" :key="n" class="h-2.5 flex-1 rounded" :class="n <= selected.publications ? 'bg-[#14713C]' : 'bg-[#EDE9E4]'" />
              </div>
              <p class="mt-3 text-sm text-[#4A443E]">{{ selected.publicationNote }}</p>
              <p class="mt-2 text-sm text-[#4A443E]">Célébrant : <strong>{{ selected.celebrant }}</strong></p>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-[#DDD7CF] bg-[#F7F5F2] p-4">
          <button class="rounded border border-[#C2BAB0] bg-white px-4 py-2 text-sm font-semibold text-[#2E2925]" @click="closeCase">Fermer</button>
          <button class="rounded bg-[#14345E] px-4 py-2 text-sm font-bold text-white" @click="closeCase">Enregistrer</button>
        </div>
      </div>
    </div>

    <div v-if="showNew" class="fixed inset-0 z-50 grid place-items-center bg-[#0B1F3A]/45 p-4" @click.self="showNew = false">
      <form class="w-full max-w-lg rounded-md border border-[#C2BAB0] bg-white shadow-xl" @submit.prevent="createCase">
        <div class="flex items-center justify-between border-b border-[#DDD7CF] p-5">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.12em] text-[#C25A34]">Nouveau dossier</p>
            <h2 class="mt-1 font-serif text-2xl text-[#2E2925]">Ouvrir un dossier de mariage</h2>
          </div>
          <button type="button" class="rounded p-1 text-[#6B655D]" @click="showNew = false"><X :size="20" /></button>
        </div>
        <div class="grid gap-4 p-5">
          <label class="text-sm font-semibold text-[#2E2925]">Fiancé
            <input v-model="newGroom" required class="mt-1.5 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal outline-none focus:border-[#14345E]" placeholder="Nom et prénoms" />
          </label>
          <label class="text-sm font-semibold text-[#2E2925]">Fiancée
            <input v-model="newBride" required class="mt-1.5 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal outline-none focus:border-[#14345E]" placeholder="Nom et prénoms" />
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="text-sm font-semibold text-[#2E2925]">Date
              <input v-model="newDate" required type="date" class="mt-1.5 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal outline-none focus:border-[#14345E]" />
            </label>
            <label class="text-sm font-semibold text-[#2E2925]">Heure
              <input v-model="newTime" required type="time" class="mt-1.5 w-full rounded border border-[#C2BAB0] px-3 py-2.5 font-normal outline-none focus:border-[#14345E]" />
            </label>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-[#DDD7CF] bg-[#F7F5F2] p-4">
          <button type="button" class="rounded border border-[#C2BAB0] bg-white px-4 py-2 text-sm font-semibold" @click="showNew = false">Annuler</button>
          <button type="submit" class="rounded bg-[#14345E] px-4 py-2 text-sm font-bold text-white">Créer le dossier</button>
        </div>
      </form>
    </div>
  </section>
</template>
