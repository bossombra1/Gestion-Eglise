<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, ClipboardList, FileText, MessageSquare, Megaphone, BookOpen, Heart, Users } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import StatCard from '@/components/molecules/StatCard.vue'
import { administrationApi, type AdministrationDashboard } from '@/services/administration.service'

const dashboard = ref<AdministrationDashboard | null>(null)
const loading = ref(true)
const error = ref('')

const kpis = computed(() => [
  {
    label: 'Mouvements actifs',
    value: dashboard.value ? String(dashboard.value.movements.active) : '—',
    hint: dashboard.value ? `${dashboard.value.movements.total} au total` : 'Chargement...',
  },
  {
    label: 'Inscriptions en cours',
    value: dashboard.value ? String(dashboard.value.registrations.pending) : '—',
    hint: dashboard.value ? `${dashboard.value.registrations.total} au total` : 'Chargement...',
  },
  {
    label: 'Demandes de messe',
    value: dashboard.value ? String(dashboard.value.massIntentions.total) : '—',
    hint: dashboard.value ? `${dashboard.value.massIntentions.pending} en attente` : 'Chargement...',
  },
  {
    label: 'Utilisateurs actifs',
    value: dashboard.value ? String(dashboard.value.users.active) : '—',
    hint: dashboard.value ? `${dashboard.value.users.total} au total` : 'Chargement...',
  },
])

const links = [
  { to: '/administration/intentions', label: 'Gérer les intentions', description: 'Demandes de messe à traiter', icon: Megaphone },
  { to: '/administration/registres', label: 'Consulter les registres', description: 'Registre sacramentel', icon: BookOpen },
  { to: '/administration/bans', label: 'Suivre les bans', description: 'Bans de mariage', icon: Heart },
  { to: '/administration/rapports-mouvements', label: 'Suivre les inscriptions', description: 'Rapports des mouvements', icon: Users },
  { to: '/administration/communications', label: 'Publier une communication', description: 'Annonces et campagnes', icon: MessageSquare },
]

const loadDashboard = async () => {
  loading.value = true
  error.value = ''
  try {
    dashboard.value = await administrationApi.getDashboard()
  } catch {
    error.value = 'Impossible de charger les données du tableau de bord.'
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <section class="space-y-6">
    <div class="mb-4 flex flex-col gap-2 border-b border-[#C2BAB0] pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C25A34]">Administration paroissiale</p>
        <h1 class="mt-1 font-['Source_Serif_4'] text-[32px] font-semibold leading-none tracking-[-0.02em] text-[#2E2925] sm:text-[38px]">Tableau de bord</h1>
        <p class="mt-2 text-[13.5px] leading-5 text-[#6B655D]">{{ dashboard?.parish.name ?? 'Votre paroisse' }} · activité consolidée du secrétariat.</p>
      </div>
      <RouterLink to="/administration/intentions" class="inline-flex min-h-9 items-center justify-center gap-2 rounded-[5px] bg-[#14345E] px-3.5 text-[13.5px] font-bold text-white hover:bg-[#0E2A4E]">
        <ArrowRight class="size-4" /> Voir les intentions
      </RouterLink>
    </div>

    <div v-if="error" class="border border-[#B3261E]/30 bg-[#FFF5F4] p-4 text-sm text-[#B3261E]">
      {{ error }}
      <button class="ml-2 font-semibold underline" @click="loadDashboard">Réessayer</button>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <RouterLink v-for="item in kpis" :key="item.label" :to="item.to ?? '/administration/dashboard'" class="rounded-[5px] border border-[#EDE9E4] border-l-4 bg-white p-[13px_14px] transition hover:bg-[#FBFAF8]" :class="item.tone === 'warning' ? 'border-l-[#8A5200]' : item.tone === 'success' ? 'border-l-[#14713C]' : item.tone === 'blue' ? 'border-l-[#14345E]' : 'border-l-[#C25A34]'">
        <div class="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-[#6B655D]">{{ item.label }}</div>
        <div class="mt-1 text-[34px] font-bold leading-none tabular-nums text-[#2E2925]">{{ item.value }}</div>
        <div class="mt-2 text-[13.5px] text-[#4A443E]">{{ item.hint }}</div>
      </RouterLink>
    </div>

    <div class="mt-3 grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="overflow-hidden rounded-[5px] border border-[#EDE9E4] bg-white">
        <div class="flex items-center gap-3 border-b border-[#EDE9E4] px-3.5 py-[11px]">
          <div class="text-[15.5px] font-bold text-[#2E2925]">Activité des mouvements</div>
          <RouterLink to="/administration/rapports-mouvements" class="ml-auto text-[13.5px] font-semibold text-[#A84A28] hover:underline">Tout voir →</RouterLink>
        </div>
        <div v-if="loading" class="p-5 text-[13.5px] text-[#6B655D]">Chargement des données…</div>
        <table v-else class="w-full text-[13px]">
          <thead class="border-b border-[#EDE9E4] bg-[#FBFAF8] text-left text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#6B655D]">
            <tr><th class="px-3.5 py-2.5">Mouvement</th><th class="px-3.5 py-2.5">Membres</th><th class="px-3.5 py-2.5">Inscriptions</th><th class="px-3.5 py-2.5">Statut</th></tr>
          </thead>
          <tbody>
            <tr v-for="movement in dashboard?.movementActivity" :key="movement.id" class="border-b border-[#EDE9E4] last:border-0 hover:bg-[#FBFAF8]">
              <td class="px-3.5 py-3"><div class="font-semibold text-[#2E2925]">{{ movement.name }}</div><div class="mt-0.5 text-[12px] text-[#6B655D]">{{ movement.code }}</div></td>
              <td class="px-3.5 py-3 tabular-nums">{{ movement._count.members }}</td>
              <td class="px-3.5 py-3 tabular-nums">{{ movement._count.registrations }}</td>
              <td class="px-3.5 py-3"><span class="inline-flex rounded-[14px] border border-[#14713C] bg-[#E4F1E8] px-2.5 py-0.5 text-[12px] font-semibold text-[#14713C]">{{ movement.status === 'ACTIVE' ? 'Actif' : movement.status }}</span></td>
            </tr>
          </tbody>
        </table>
        <div v-if="!loading && !dashboard?.movementActivity.length" class="p-5 text-[13.5px] text-[#6B655D]">Aucun mouvement enregistré.</div>
      </div>

      <div class="grid gap-3">
        <div class="overflow-hidden rounded-[5px] border-2 border-[#8A5200] bg-white">
          <div class="flex items-center gap-2 border-b border-[#8A5200] bg-[#FDF3DC] px-3 py-[9px]">
            <Clock3 class="size-[19px] text-[#8A5200]" /><div class="text-[14px] font-bold text-[#8A5200]">À traiter</div>
            <span class="ml-auto rounded-[10px] bg-white px-2 py-0.5 text-[12px] font-semibold text-[#8A5200]">{{ dashboard?.massIntentions.pending ?? '—' }}</span>
          </div>
          <div class="grid gap-3 p-3">
            <RouterLink to="/administration/intentions" class="block border-b border-[#EDE9E4] pb-3">
              <div class="text-[14px] font-bold text-[#2E2925]">Intentions en attente</div>
              <div class="mt-1 text-[13.5px] text-[#4A443E]">{{ dashboard?.massIntentions.pending ?? 0 }} demande(s) à valider.</div>
              <div class="mt-2 font-semibold text-[#A84A28]">Ouvrir la file →</div>
            </RouterLink>
            <RouterLink to="/administration/rapports-mouvements" class="block">
              <div class="text-[14px] font-bold text-[#2E2925]">Inscriptions à examiner</div>
              <div class="mt-1 text-[13.5px] text-[#4A443E]">{{ dashboard?.registrations.pending ?? 0 }} dossier(s) en attente.</div>
              <div class="mt-2 font-semibold text-[#A84A28]">Voir les dossiers →</div>
            </RouterLink>
          </div>
        </div>
        <div class="rounded-[5px] border border-[#EDE9E4] bg-white p-3">
          <div class="text-[14px] font-bold text-[#2E2925]">Repères du jour</div>
          <div class="mt-2 grid gap-2 text-[13px] text-[#4A443E]">
            <div class="flex justify-between border-b border-[#EDE9E4] pb-2"><span>Intentions confirmées</span><strong class="tabular-nums text-[#14345E]">{{ dashboard?.massIntentions.confirmed ?? '—' }}</strong></div>
            <div class="flex justify-between border-b border-[#EDE9E4] pb-2"><span>Inscriptions approuvées</span><strong class="tabular-nums text-[#14345E]">{{ dashboard?.registrations.approved ?? '—' }}</strong></div>
            <div class="flex justify-between"><span>Utilisateurs actifs</span><strong class="tabular-nums text-[#14713C]">{{ dashboard?.users.active ?? '—' }}</strong></div>
          </div>
        </div>
      </div>
    </div>
  <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#C2BAB0] pt-3 text-[12px] text-[#6B655D]">
      <span>Données synchronisées</span><span>Action requise</span><span class="ml-auto">Les indicateurs restent liés aux écrans de traitement.</span>
    </div>
  </section>
</template>
