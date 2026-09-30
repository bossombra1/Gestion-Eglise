<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, BarChart3, ClipboardList, FileText, MessageSquare, Receipt, Users } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import StatCard from '@/components/molecules/StatCard.vue'
import { administrationApi, type AdministrationDashboard } from '@/services/administration.service'

const dashboard = ref<AdministrationDashboard | null>(null)
const loading = ref(true)
const error = ref('')

const formatAmount = (amount: number, currency = 'XOF') =>
  new Intl.NumberFormat('fr-FR').format(amount) + (currency === 'XOF' ? ' FCFA' : ` ${currency}`)

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
    label: 'Cotisations encaissées',
    value: dashboard.value ? formatAmount(dashboard.value.payments.totalAmount, dashboard.value.payments.currency) : '—',
    hint: dashboard.value ? `${dashboard.value.payments.successful} paiements réussis` : 'Chargement...',
  },
  {
    label: 'Utilisateurs actifs',
    value: dashboard.value ? String(dashboard.value.users.active) : '—',
    hint: dashboard.value ? `${dashboard.value.users.total} au total` : 'Chargement...',
  },
])

const links = [
  { to: '/administration/mouvements', label: 'Piloter les mouvements', description: 'Catalogue et responsables', icon: Users },
  { to: '/administration/inscriptions', label: 'Suivre les inscriptions', description: 'Vue consolidée, sans remplacer le responsable', icon: ClipboardList },
  { to: '/administration/finances', label: 'Superviser les finances', description: 'Cotisations, dons et paiements', icon: Receipt },
  { to: '/administration/rapports', label: 'Consulter les rapports', description: 'Rapports transmis par les responsables', icon: FileText },
  { to: '/administration/communications', label: 'Publier une communication', description: 'Annonces et campagnes', icon: MessageSquare },
  { to: '/administration/activite', label: 'Voir l’activité', description: 'Indicateurs par mouvement', icon: BarChart3 },
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
    <header class="border border-[#C2BAB0] bg-white p-5 sm:p-7 lg:p-8">
      <p class="eyebrow text-[#C25A34]">Administration paroissiale</p>
      <div class="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="page-title text-3xl text-[#0B1F3A] sm:text-4xl lg:text-5xl">Tableau de bord</h1>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-[#6B655D]">
            {{ dashboard?.parish.name ?? 'Votre paroisse' }} · vue consolidée de l’activité paroissiale.
          </p>
        </div>
        <RouterLink to="/administration/rapports" class="inline-flex min-h-11 items-center justify-center gap-2 bg-[#C25A34] px-4 text-sm font-semibold text-white hover:bg-[#A84A28]">
          Voir les rapports <ArrowRight class="size-4" />
        </RouterLink>
      </div>
    </header>

    <div v-if="error" class="border border-[#B3261E]/30 bg-[#FFF5F4] p-4 text-sm text-[#B3261E]">
      {{ error }}
      <button class="ml-2 font-semibold underline" @click="loadDashboard">Réessayer</button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard v-for="item in kpis" :key="item.label" :label="item.label" :value="item.value" :hint="item.hint" />
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <article class="border border-[#C2BAB0] bg-white">
        <div class="border-b border-[#DDD7CF] px-5 py-5 sm:px-6">
          <p class="eyebrow text-[#6B655D]">Pilotage</p>
          <h2 class="page-title mt-1 text-2xl text-[#14345E]">Actions de supervision</h2>
        </div>
        <nav class="grid divide-y divide-[#EDE9E4] sm:grid-cols-2 sm:divide-y-0">
          <RouterLink v-for="item in links" :key="item.to" :to="item.to" class="flex min-h-28 items-start gap-3 border-b border-[#EDE9E4] p-5 hover:bg-[#F7F5F2] sm:border-r">
            <component :is="item.icon" class="mt-1 size-5 shrink-0 text-[#C25A34]" />
            <span>
              <span class="block text-sm font-semibold text-[#2E2925]">{{ item.label }}</span>
              <span class="mt-1 block text-xs leading-5 text-[#6B655D]">{{ item.description }}</span>
            </span>
            <ArrowRight class="ml-auto mt-1 size-4 shrink-0 text-[#6B655D]" />
          </RouterLink>
        </nav>
      </article>

      <article class="border border-[#C2BAB0] bg-white p-5 sm:p-6">
        <p class="eyebrow text-[#6B655D]">Activité</p>
        <h2 class="page-title mt-1 text-2xl text-[#14345E]">Mouvements</h2>
        <div v-if="loading" class="mt-5 text-sm text-[#6B655D]">Chargement...</div>
        <div v-else class="mt-5 space-y-3">
          <div v-for="movement in dashboard?.movementActivity" :key="movement.id" class="flex items-center justify-between border-b border-[#EDE9E4] pb-3 last:border-0">
            <div>
              <p class="text-sm font-semibold text-[#2E2925]">{{ movement.name }}</p>
              <p class="text-xs text-[#6B655D]">{{ movement._count.members }} membres · {{ movement._count.registrations }} inscriptions</p>
            </div>
            <span class="text-xs font-semibold" :class="movement.status === 'ACTIVE' ? 'text-[#14713C]' : 'text-[#6B655D]'">
              {{ movement.status === 'ACTIVE' ? 'Actif' : movement.status }}
            </span>
          </div>
          <p v-if="!dashboard?.movementActivity.length" class="text-sm text-[#6B655D]">Aucun mouvement enregistré.</p>
        </div>
      </article>
    </div>
  </section>
</template>
