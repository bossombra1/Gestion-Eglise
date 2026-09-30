<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bell, Clock3, Info, Megaphone, Paperclip, Send, Users } from 'lucide-vue-next'
import { administrationMovementsApi, type AdministrationMovement } from '@/services/administration-movements.service'
import { administrationCommunicationsApi, type AdministrationCommunication } from '@/services/administration-communications.service'

const audience = ref('movement-parents')
const movement = ref('')
const movements = ref<AdministrationMovement[]>([])
const history = ref<AdministrationCommunication[]>([])
const nature = ref<'informative' | 'urgent'>('informative')
const subject = ref('')
const message = ref('')
const saved = ref(false)
const showConfirmation = ref(false)
const sent = ref(false)
const loading = ref(true)
const error = ref('')
const sending = ref(false)

const charCount = computed(() => message.value.length)
const smsCount = computed(() => Math.max(1, Math.ceil(charCount.value / 160)))
const selectedMovement = computed(() => movements.value.find(m => m.id === movement.value))
const audienceCount = computed(() => audience.value === 'all' ? movements.value.reduce((n,m)=>n+(m._count?.members??0),0) : selectedMovement.value?._count?.members ?? 0)

async function load() {
  loading.value = true
  try {
    movements.value = await administrationMovementsApi.list()
    if (!movement.value && movements.value[0]) movement.value = movements.value[0].id
    history.value = await administrationCommunicationsApi.list()
  } catch { error.value = 'Impossible de charger les communications.' }
  finally { loading.value = false }
}
function saveDraft(){ saved.value=true; window.setTimeout(()=>saved.value=false,2500) }
async function sendMessage(){
  if(!movement.value || !subject.value.trim() || !message.value.trim()) return
  sending.value=true; error.value=''
  try {
    const item=await administrationCommunicationsApi.send({movementId:movement.value,title:subject.value,content:message.value,type:nature.value==='urgent'?'REMINDER':'INFORMATION',audience:audience.value==='movement-members'?'MEMBERS':audience.value==='movement-parents'?'PARENTS':'ALL',sendNow:true})
    history.value.unshift(item); sent.value=true; showConfirmation.value=false
  } catch { error.value='Impossible d’envoyer le message.' }
  finally { sending.value=false }
}
onMounted(load)
</script>

<template>
  <section class="min-w-0 overflow-hidden border border-[#C2BAB0] bg-[#F7F5F2]">
    <div class="flex flex-col gap-3 border-b border-[#DDD7CF] bg-white px-4 py-3 sm:px-5 lg:flex-row lg:items-center">
      <div>
        <h1 class="text-[20px] font-bold leading-tight text-[#2E2925]">Nouveau message</h1>
        <p class="text-[13.5px] text-[#6B655D]">{{ saved ? 'Brouillon enregistré à l’instant' : 'Brouillon non envoyé' }}</p>
      </div>
      <div class="flex flex-wrap gap-2 lg:ml-auto">
        <button class="min-h-10 border-[1.5px] border-[#C2BAB0] bg-white px-3 text-sm font-semibold text-[#2E2925]" @click="saveDraft">Enregistrer le brouillon</button>
        <button class="inline-flex min-h-10 items-center gap-2 border-[1.5px] border-[#14345E] bg-white px-3 text-sm font-semibold text-[#14345E]"><Clock3 class="size-4" />Programmer</button>
        <button class="inline-flex min-h-10 items-center gap-2 bg-[#14345E] px-3.5 text-sm font-bold text-white hover:bg-[#0E2A4E]" @click="showConfirmation = true"><Send class="size-4" />Vérifier et envoyer</button>
      </div>
    </div>

    <div class="grid lg:grid-cols-[300px_minmax(0,1fr)_380px]">
      <aside class="border-b border-[#EDE9E4] bg-white p-4 lg:border-b-0 lg:border-r">
        <div class="text-[12.5px] font-bold uppercase tracking-[.06em] text-[#A84A28]">Audience</div>
        <div class="mt-3 grid gap-2">
          <button v-for="item in [
            {id:'all',label:'Tous les fidèles inscrits',count:1842},
            {id:'movement-parents',label:'Parents d’un mouvement',count:96},
            {id:'movement-members',label:'Membres d’un mouvement',count:412},
            {id:'donors',label:'Donateurs d’un projet',count:214}
          ]" :key="item.id" class="flex min-h-11 items-center gap-2.5 border px-3 text-left text-[14.5px]" :class="audience===item.id ? 'border-2 border-[#14345E] bg-[#E8EDF5] text-[#14345E]' : 'border-[#DDD7CF] bg-white text-[#2E2925]'" @click="audience=item.id">
            <span class="size-[17px] shrink-0 rounded-full border-2" :class="audience===item.id ? 'border-[5px] border-[#14345E] bg-white' : 'border-[#C2BAB0]'"></span>
            <span class="min-w-0 flex-1">{{ item.label }}</span><span class="text-[13px] tabular-nums">{{ item.count.toLocaleString('fr-FR') }}</span>
          </button>
        </div>
        <div class="mt-5">
          <label class="text-[13.5px] font-semibold text-[#2E2925]">Mouvement concerné</label>
          <select v-model="movement" class="mt-1 min-h-11 w-full border-[1.5px] border-[#C2BAB0] bg-white px-3 text-sm"><option v-for="item in movements" :key="item.id" :value="item.id">{{ item.name }}</option></select>
        </div>
        <div class="mt-4 bg-[#F7F5F2] p-3">
          <div class="text-sm font-bold text-[#2E2925]">{{ audienceCount }} destinataires</div>
          <div class="mt-2 grid gap-1.5 text-[13.5px] text-[#4A443E]">
            <div class="flex justify-between"><span>Push dans l’app</span><b>71</b></div>
            <div class="flex justify-between"><span>SMS</span><b>96</b></div>
            <div class="flex justify-between"><span>WhatsApp</span><b>83</b></div>
            <div class="mt-1 flex justify-between border-t border-[#DDD7CF] pt-1.5"><span>Coût SMS estimé</span><b class="text-[#14345E]">2 880 FCFA</b></div>
          </div>
        </div>
        <div class="mt-3 flex gap-2 bg-[#FDF3DC] p-3 text-[13px] leading-5 text-[#2E2925]"><Clock3 class="mt-0.5 size-4 shrink-0 text-[#8A5200]" />Message informatif : l’envoi sera différé après 6 h si vous validez la nuit.</div>
      </aside>

      <main class="p-4 sm:p-5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[13.5px] font-semibold">Nature :</span>
          <button class="inline-flex min-h-9 items-center gap-2 border-2 border-[#14345E] bg-[#E8EDF5] px-3 text-sm font-bold text-[#14345E]" @click="nature='informative'"><Info class="size-4" />Informatif</button>
          <button class="inline-flex min-h-9 items-center gap-2 border border-[#C2BAB0] bg-white px-3 text-sm" :class="nature==='urgent' ? 'border-2 border-[#B3261E] text-[#B3261E]' : ''" @click="nature='urgent'">Urgent</button>
          <span class="text-xs text-[#6B655D]">L’urgent ignore les préférences de canal et part sur les trois.</span>
        </div>
        <label class="mt-4 block text-[13.5px] font-semibold">Objet<input v-model="subject" class="mt-1 min-h-11 w-full border-[1.5px] border-[#C2BAB0] bg-white px-3 text-[15px] outline-none focus:border-[#14345E]" /></label>
        <div class="mt-4">
          <div class="mb-1.5 flex items-center gap-2"><span class="text-[13.5px] font-semibold">Message</span><div class="ml-auto flex gap-1.5"><button class="border border-[#DDD7CF] px-2 py-1 text-xs">Insérer : prénom de l’enfant</button><button class="border border-[#DDD7CF] px-2 py-1 text-xs">date</button></div></div>
          <textarea v-model="message" class="min-h-[210px] w-full border-2 border-[#14345E] bg-white p-3 text-[15px] leading-[1.6] outline-none shadow-[0_0_0_3px_rgba(20,52,94,.15)]"></textarea>
          <div class="mt-1.5 flex flex-wrap gap-4 text-[13px] text-[#6B655D]"><span>{{ charCount }} caractères</span><span class="font-semibold text-[#8A5200]">SMS : {{ smsCount }} messages par destinataire</span><span class="font-semibold text-[#A84A28]">Raccourcir pour un seul SMS</span></div>
        </div>
        <div class="mt-4">
          <div class="text-[13.5px] font-semibold">Pièce jointe (WhatsApp et app uniquement)</div>
          <label class="mt-1 flex min-h-12 cursor-pointer items-center gap-2.5 border-[1.5px] border-dashed border-[#C2BAB0] bg-white px-3 text-sm text-[#6B655D]"><Paperclip class="size-5" />Déposer une affiche ou un PDF · 2 Mo maximum<input type="file" class="hidden" /></label>
        </div>
      </main>

      <aside class="border-t border-[#EDE9E4] bg-white p-4 sm:p-5 lg:border-l lg:border-t-0">
        <div class="text-[12.5px] font-bold uppercase tracking-[.06em] text-[#A84A28]">Aperçu par canal</div>
        <div class="mt-4">
          <div class="mb-2 flex items-center gap-2 text-[13.5px] font-semibold"><Bell class="size-4 text-[#14345E]" />Notification push · 71 personnes</div>
          <div class="rounded-lg bg-[#0B1F3A] p-3"><div class="rounded-md bg-white/10 p-3"><div class="text-[11.5px] text-[#C3D0E1]">EcclesiaConnect · maintenant</div><div class="mt-1 text-[13.5px] font-bold text-white">{{ subject }}</div><div class="mt-1 text-[13px] leading-5 text-[#C3D0E1]">{{ message.slice(0,110) }}{{ message.length > 110 ? '…' : '' }}</div></div></div>
          <p class="mt-1.5 text-xs leading-5 text-[#6B655D]">Écran verrouillé : ni nom d’enfant, ni montant, ni donnée de santé.</p>
        </div>
        <div class="mt-5">
          <div class="mb-2 flex items-center gap-2 text-[13.5px] font-semibold"><Megaphone class="size-4 text-[#14345E]" />SMS · 96 personnes</div>
          <div class="border border-[#DDD7CF] bg-[#F7F5F2] p-3 text-[13.5px] leading-5">{{ message.slice(0,159) }}</div>
          <div class="mt-1.5 flex justify-between text-xs text-[#6B655D]"><span>{{ Math.min(160,charCount) }} caractères · {{ smsCount }} SMS</span><span>960 FCFA au total</span></div>
        </div>
        <div class="mt-5">
          <div class="mb-2 flex items-center gap-2 text-[13.5px] font-semibold"><Users class="size-4 text-[#14345E]" />WhatsApp · 83 personnes</div>
          <div class="rounded-lg bg-[#E4F1E8] p-3 text-[13.5px] leading-5 whitespace-pre-line">{{ message.slice(0,260) }}{{ message.length > 260 ? '…' : '' }}</div>
        </div>
      </aside>
    </div>
  
    <div class="mt-6 grid gap-6 xl:grid-cols-[560px_minmax(0,1fr)]">
      <section class="border border-[#C2BAB0] bg-white">
        <div class="border-b border-[#EDE9E4] p-5">
          <div class="flex items-start gap-3">
            <div class="grid size-10 shrink-0 place-items-center rounded bg-[#E8EDF5]"><Send class="size-5 text-[#14345E]" /></div>
            <div>
              <h2 class="text-lg font-bold text-[#2E2925]">Confirmation d’envoi</h2>
              <p class="mt-1 text-sm leading-5 text-[#4A443E]">Un message parti ne peut pas être rappelé. Vérifiez la date et le lieu une dernière fois.</p>
            </div>
          </div>
        </div>
        <div class="grid gap-3 p-4">
          <div class="grid gap-2 rounded bg-[#F7F5F2] p-3 text-sm">
            <div class="flex justify-between gap-4"><span class="text-[#6B655D]">Audience</span><b>Parents · {{ movement }}</b></div>
            <div class="flex justify-between gap-4"><span class="text-[#6B655D]">Canaux</span><b>Push 71 · SMS 96 · WhatsApp 83</b></div>
            <div class="flex justify-between gap-4"><span class="text-[#6B655D]">Nature</span><b>{{ nature === 'urgent' ? 'Urgent' : 'Informatif' }} · envoi immédiat</b></div>
            <div class="flex justify-between gap-4 border-t border-[#DDD7CF] pt-2"><span class="text-[#6B655D]">Coût SMS</span><b class="text-[#14345E]">2 880 FCFA</b></div>
          </div>
          <div class="flex gap-2.5 bg-[#FDF3DC] p-3 text-sm leading-5">
            <Info class="mt-0.5 size-4 shrink-0 text-[#8A5200]" />
            <span>Aucune donnée personnelle ne doit figurer dans un message de groupe.</span>
          </div>
          <div class="flex justify-end gap-2">
            <button class="min-h-10 border border-[#C2BAB0] bg-white px-4 text-sm font-semibold" @click="showConfirmation = true">Revenir au brouillon</button>
            <button class="inline-flex min-h-10 items-center gap-2 bg-[#14345E] px-4 text-sm font-bold text-white" @click="sendMessage"><Send class="size-4" />Envoyer maintenant</button>
          </div>
          <p v-if="sent" class="text-sm font-semibold text-[#14713C]">Message enregistré comme envoyé.</p>
        </div>
      </section>

      <section class="border border-[#C2BAB0] bg-white">
        <div class="border-b border-[#EDE9E4] px-4 py-3">
          <h2 class="text-[15px] font-bold text-[#2E2925]">Historique des envois</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[560px] text-[13.5px]">
            <thead class="bg-[#F7F5F2] text-left text-xs font-bold uppercase tracking-wide text-[#6B655D]">
              <tr><th class="px-3 py-2.5">Message</th><th class="w-20 px-2 py-2.5">Envoyé</th><th class="w-20 px-2 py-2.5">Reçus</th><th class="w-16 px-2 py-2.5">Lus</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in history"" :key="item.message" class="border-t border-[#EDE9E4]">
                <td class="px-3 py-2.5"><div class="font-semibold text-[#2E2925]">{{ item.title }}</div><div class="text-[#6B655D]">{{ item.movement?.name || 'Paroisse' }} · {{ item.type }}</div></td>
                <td class="px-2 py-2.5 tabular-nums">{{ item.sentAt ? new Date(item.sentAt).toLocaleDateString('fr-FR') : 'Brouillon' }}</td><td class="px-2 py-2.5 tabular-nums">{{ item.recipients.length }}</td><td class="px-2 py-2.5 tabular-nums">{{ item.recipients.length ? Math.round(item.recipients.filter(r => r.readAt).length / item.recipients.length * 100) : 0 }} %</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="border-t border-[#EDE9E4] px-3 py-2.5 text-xs leading-5 text-[#6B655D]">Le taux de lecture ne couvre que l’app et WhatsApp. Un SMS est compté comme reçu, jamais comme lu.</div>
      </section>
    </div>

    <div v-if="showConfirmation" class="fixed inset-0 z-50 grid place-items-center bg-[#0B1F3A]/45 p-4" @click.self="showConfirmation = false">
      <div class="w-full max-w-xl border border-[#C2BAB0] bg-white shadow-xl">
        <div class="flex items-start gap-3 border-b border-[#EDE9E4] p-5">
          <div class="grid size-10 shrink-0 place-items-center rounded bg-[#E8EDF5]"><Send class="size-5 text-[#14345E]" /></div>
          <div><h2 class="text-xl font-bold text-[#2E2925]">Envoyer à {{ audienceCount }} destinataires ?</h2><p class="mt-1 text-sm leading-5 text-[#4A443E]">Vérifiez une dernière fois le contenu et le coût avant diffusion.</p></div>
        </div>
        <div class="p-5">
          <div class="grid gap-2 rounded bg-[#F7F5F2] p-3 text-sm">
            <div class="flex justify-between gap-4"><span class="text-[#6B655D]">Objet</span><b>{{ subject }}</b></div>
            <div class="flex justify-between gap-4"><span class="text-[#6B655D]">Audience</span><b>{{ movement }}</b></div>
            <div class="flex justify-between gap-4"><span class="text-[#6B655D]">Coût SMS</span><b class="text-[#14345E]">2 880 FCFA</b></div>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-[#DDD7CF] bg-[#F7F5F2] p-4">
          <button class="min-h-10 border border-[#C2BAB0] bg-white px-4 text-sm font-semibold" @click="showConfirmation = false">Revenir au brouillon</button>
          <button class="inline-flex min-h-10 items-center gap-2 bg-[#14345E] px-4 text-sm font-bold text-white" @click="sent = true; showConfirmation = false"><Send class="size-4" />Envoyer maintenant</button>
        </div>
      </div>
    </div>
  </section>
</template>