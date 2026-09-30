<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bell, Clock3, Info, Megaphone, Paperclip, Send, Users } from 'lucide-vue-next'

const audience = ref('movement-parents')
const movement = ref('Scouts et Guides')
const nature = ref<'informative' | 'urgent'>('informative')
const subject = ref('Première rencontre des Scouts — samedi 12 septembre')
const message = ref('Chers parents,\n\nLa première rencontre des Scouts et Guides aura lieu samedi 12 septembre à 15 h, dans la cour de la paroisse. Prévoyez une tenue simple et une gourde d\'eau. La rencontre se termine à 18 h.\n\nLes inscriptions restent ouvertes jusqu\'au 30 septembre.\n\nLe secrétariat paroissial')
const saved = ref(false)

const charCount = computed(() => message.value.length)
const smsCount = computed(() => Math.max(1, Math.ceil(charCount.value / 160)))
const audienceCount = computed(() => audience.value === 'all' ? 1842 : audience.value === 'movement-members' ? 412 : 96)

const saveDraft = () => {
  saved.value = true
  window.setTimeout(() => { saved.value = false }, 2500)
}
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
        <button class="inline-flex min-h-10 items-center gap-2 bg-[#14345E] px-3.5 text-sm font-bold text-white hover:bg-[#0E2A4E]"><Send class="size-4" />Vérifier et envoyer</button>
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
          <select v-model="movement" class="mt-1 min-h-11 w-full border-[1.5px] border-[#C2BAB0] bg-white px-3 text-sm"><option>Scouts et Guides</option><option>Chorale</option><option>Jeunesse</option></select>
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
  </section>
</template>