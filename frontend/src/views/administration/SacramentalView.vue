<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { FileText, Plus, Search, X, AlertTriangle } from 'lucide-vue-next'
import { sacramentalApi, type SacramentalAct, type SacramentalPerson } from '@/services/administration-sacramental.service'
const query=ref(''); const selected=ref(0); const showNewAct=ref(false); const people=ref<{name:string;birth:string;acts:number;id:string}[]>([]); const acts=ref<SacramentalAct[]>([]); const form=ref({personId:'',type:'BAPTISM',celebrationDate:'',celebrantName:'',place:'',registerNumber:'',certificateNumber:''}); const error=ref('')
const filtered=computed(()=>{const q=query.value.trim().toLowerCase();return q?people.value.filter(p=>p.name.toLowerCase().includes(q)):people.value})
const person=computed(()=>filtered.value[selected.value]??people.value[0])
const selectedActs=computed(()=>acts.value.filter(a=>a.personId===person.value?.id))
const rows=computed(()=>selectedActs.value.map(a=>({s:a.type,d:new Date(a.celebrationDate).toLocaleDateString('fr-FR'),r:a.registerNumber||'—',id:a.id})))
async function load(){try{const d=await sacramentalApi.list(query.value);acts.value=d.acts;people.value=d.people.map(p=>({id:p.id,name:p.firstName+' '+p.lastName,birth:p.faithfulProfile?.birthDate?'Né(e) le '+new Date(p.faithfulProfile.birthDate).toLocaleDateString('fr-FR'):'Date de naissance non renseignée',acts:d.acts.filter(a=>a.personId===p.id).length}));if(selected.value>=people.value.length)selected.value=0}catch{error.value='Impossible de charger le registre.'}}
async function createAct(){try{await sacramentalApi.create(form.value);showNewAct.value=false;await load()}catch{error.value='Impossible d’inscrire l’acte.'}}
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

    <div class="overflow-hidden rounded-[6px] border border-[#C2BAB0] bg-[#F7F5F2]">
      <header class="flex flex-col gap-3 border-b border-[#DDD7CF] bg-white px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <div>
          <h2 class="text-[20px] font-bold text-[#2E2925]">Registre sacramentel</h2>
          <p class="text-[13.5px] text-[#6B655D]">4 218 actes · dernier ajout hier</p>
        </div>
        <div class="flex flex-1 justify-end gap-2">
          <label class="flex min-h-9 w-full max-w-[300px] items-center gap-2 rounded-[5px] border-[1.5px] border-[#C2BAB0] bg-white px-2.5">
            <Search class="size-4 text-[#6B655D]" />
            <input v-model="query" class="min-w-0 flex-1 border-0 bg-transparent text-[14px] outline-none" placeholder="Rechercher un nom" />
            <button v-if="query" type="button" @click="query=''" class="text-[#6B655D]"><X class="size-3.5" /></button>
          </label>
          <button type="button" @click="form.personId=person?.id||'';showNewAct=true" class="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-[5px] bg-[#14345E] px-3.5 text-[13.5px] font-bold text-white hover:bg-[#0E2A4E]">
            <Plus class="size-4" /> Nouvel acte
          </button>
        </div>
      </header>

      <div class="grid min-w-0 xl:grid-cols-[296px_minmax(0,1fr)_400px]">
        <aside class="border-b border-[#EDE9E4] bg-white xl:border-b-0 xl:border-r">
          <div class="border-b border-[#EDE9E4] px-3.5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#6B655D]">{{ filtered.length }} résultats pour « {{ query || 'tous' }} »</div>
          <button v-for="(item,index) in filtered" :key="item.name" @click="selected=index" class="block min-h-14 w-full border-b border-[#EDE9E4] px-3.5 py-2.5 text-left" :class="selected===index ? 'border-l-[3px] border-l-[#14345E] bg-[#E8EDF5]' : 'bg-white'">
            <div class="text-[15px] font-semibold" :class="selected===index ? 'text-[#14345E]' : 'text-[#2E2925]'">{{ item.name }}</div>
            <div class="text-[13px] text-[#6B655D]">{{ item.birth }}</div>
          </button>
        </aside>

        <main class="min-w-0 space-y-3 p-4 sm:p-[16px_18px]">
          <div class="flex items-center gap-3 rounded-[5px] border border-[#EDE9E4] bg-white p-3.5">
            <div class="grid size-[52px] shrink-0 place-items-center rounded-full bg-[#14345E] text-[18px] font-bold text-white">{{ person.name.split(' ').map(n=>n[0]).join('').slice(0,2) }}</div>
            <div class="min-w-0 flex-1"><div class="text-[20px] font-bold text-[#2E2925]">{{ person.name }}</div><div class="text-[13.5px] text-[#4A443E]">Née le 8 juin 1988 à Bouaké · fille de Kouassi Étienne et Aya Marguerite</div></div>
            <div class="hidden text-right sm:block"><div class="text-[12.5px] text-[#6B655D]">Dossier</div><div class="text-[14px] font-bold text-[#2E2925]">F-1988-0412</div></div>
          </div>

          <div class="overflow-hidden rounded-[5px] border border-[#EDE9E4] bg-white">
            <div class="flex flex-col gap-1 border-b border-[#EDE9E4] px-3.5 py-2.5 sm:flex-row sm:items-center"><div class="text-[15px] font-bold text-[#2E2925]">Sacrements reçus</div><div class="text-[13px] text-[#6B655D] sm:ml-auto">Registre de la paroisse et actes transcrits</div></div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[620px] text-[14px]">
                <thead class="bg-[#FBFAF8] text-left text-[11.5px] uppercase tracking-[0.05em] text-[#6B655D]"><tr><th class="px-3.5 py-2.5">Sacrement</th><th class="px-3.5 py-2.5">Date</th><th class="px-3.5 py-2.5">Registre</th><th class="px-3.5 py-2.5">Certificat</th></tr></thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.s" class="border-t border-[#EDE9E4]">
                    <td class="px-3.5 py-3"><div class="font-semibold text-[#2E2925]">{{ row.s }}</div><div class="text-[13px] text-[#6B655D]">Bouaké, St-Michel · P. Assouman</div></td><td class="px-3.5 py-3 whitespace-nowrap">{{ row.d }}</td><td class="px-3.5 py-3 text-[13px]">{{ row.r }}</td><td class="px-3.5 py-3 font-semibold text-[#A84A28]">Générer</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="flex gap-2.5 border-t border-[#EDE9E4] bg-[#FDF3DC] px-3.5 py-2.5 text-[13.5px] leading-5 text-[#2E2925]"><AlertTriangle class="mt-0.5 size-[18px] shrink-0 text-[#8A5200]" /><span><strong>Annotation du 4 février 2019</strong> — rectification du prénom de l'épouse. L'acte d'origine reste lisible.</span></div>
          </div>

          <div class="rounded-[5px] border border-[#EDE9E4] bg-white p-3.5">
            <div class="mb-2 text-[15px] font-bold text-[#2E2925]">Historique du dossier</div>
            <div class="grid gap-1.5 text-[13.5px] text-[#4A443E]"><div>14 mars 2026 · Certificat de baptême généré par Sœur Brigitte</div><div>4 févr. 2019 · Annotation portée sur l'acte de mariage</div><div>18 déc. 2010 · Acte de mariage inscrit au registre M-2010</div></div>
          </div>
        </main>

        <aside class="border-t border-[#EDE9E4] bg-white p-4 xl:border-l xl:border-t-0">
          <div class="mb-2.5 text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#A84A28]">Aperçu avant impression</div>
          <div class="rounded-[5px] bg-[#F7F5F2] p-3.5">
            <div class="bg-white p-5 shadow-sm">
              <div class="border-b border-[#DDD7CF] pb-2 text-center"><div class="text-[10.5px] uppercase tracking-[0.12em] text-[#6B655D]">Archidiocèse d'Abidjan</div><div class="text-[12.5px] font-semibold text-[#2E2925]">Paroisse Saint-Jean de Cocody</div></div>
              <div class="py-3 text-center text-[16px] font-bold text-[#14345E]">CERTIFICAT DE BAPTÊME</div>
              <p class="text-[12.5px] leading-[1.7] text-[#2E2925]">Je soussigné, curé de la paroisse, certifie qu'il résulte du registre des baptêmes, registre <strong>B-1988</strong>, folio <strong>112</strong>, numéro <strong>41</strong>, que :</p>
              <div class="my-2 border-l-2 border-[#C25A34] pl-2.5 text-[12.5px] leading-[1.7]"><strong>KOUASSI Adjoua</strong><br>Née le 8 juin 1988 à Bouaké,<br>fille de Kouassi Étienne et Aya Marguerite,<br>baptisée le 24 juillet 1988.</div>
              <div class="mt-4 text-[11px] text-[#6B655D]">Cocody, le 2 septembre 2026</div>
            </div>
          </div>
          <div class="mt-3 rounded-[5px] border border-[#B3261E] bg-[#FBE9E8] p-3 text-[13.5px] leading-5 text-[#2E2925]">Document officiel numéroté. Chaque génération est enregistrée au nom de l'agent.</div>
          <button type="button" @click="createAct" class="mt-3 min-h-10 w-full rounded-[5px] bg-[#14345E] text-[14px] font-bold text-white hover:bg-[#0E2A4E]"><FileText class="mr-2 inline size-4" /> Confirmer et générer</button>
        </aside>
      </div>
    </div>

    <div v-if="showNewAct" class="fixed inset-0 z-50 grid place-items-center bg-[#0B1F3A]/50 p-4" @click.self="showNewAct=false">
      <div class="w-full max-w-2xl overflow-hidden rounded-[6px] border border-[#C2BAB0] bg-white shadow-xl">
        <div class="border-b border-[#EDE9E4] p-4"><h2 class="text-[19px] font-bold text-[#2E2925]">Inscrire un acte de baptême</h2><p class="text-[13.5px] text-[#6B655D]">Registre B-2026 · prochain numéro 0087</p></div>
        <div class="flex gap-2 border-b border-[#B3261E] bg-[#FBE9E8] p-3 text-[13.5px] leading-5"><AlertTriangle class="size-5 shrink-0 text-[#B3261E]" /><span><strong class="text-[#B3261E]">Un acte inscrit ne peut plus être supprimé.</strong> Vérifiez chaque champ avant inscription.</span></div>
        <div class="grid gap-3 p-4 sm:grid-cols-2">
          <label class="text-[13.5px] font-semibold">Nom<input v-model="form.lastName" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal outline-none focus:border-[#14345E]" /></label>
          <label class="text-[13.5px] font-semibold">Prénoms<input v-model="form.firstName" class="mt-1 min-h-10 w-full rounded-[5px] border-2 border-[#14345E] px-3 font-normal outline-none" /></label>
          <label class="text-[13.5px] font-semibold">Date de naissance<input type="date" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" /></label>
          <label class="text-[13.5px] font-semibold">Date du baptême<input type="date" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" /></label>
          <label class="text-[13.5px] font-semibold sm:col-span-2">Ministre<input v-model="form.celebrantName" class="mt-1 min-h-10 w-full rounded-[5px] border-[1.5px] border-[#C2BAB0] px-3 font-normal" /></label>
        </div>
        <div class="flex justify-end gap-2 p-4 pt-0"><button @click="showNewAct=false" class="min-h-10 rounded-[5px] border-[1.5px] border-[#C2BAB0] px-4 text-[14px] font-semibold">Annuler</button><button class="min-h-10 rounded-[5px] bg-[#14345E] px-4 text-[14px] font-bold text-white">Inscrire définitivement au registre</button></div>
      </div>
    </div>
  </section>
</template>