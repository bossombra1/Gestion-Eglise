<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, CalendarCheck, CreditCard, FileText, MessageSquare, Users } from 'lucide-vue-next'
import StatCard from '@/components/molecules/StatCard.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import { useMouvementStore } from '@/stores/mouvement'

const store = useMouvementStore()
const totals = computed(() => store.dashboard?.totals)
const movements = computed(() => store.dashboard?.movements ?? [])
const formatAmount = (value = 0) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'

onMounted(() => store.loadDashboard())
</script>

<template>
  <section class="space-y-6">
    <header class="rounded border border-[#C2BAB0] bg-white p-6 md:p-8">
      <p class="eyebrow text-[#C25A34]">Espace responsable</p>
      <div class="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="page-title text-3xl sm:text-4xl text-[#0B1F3A] md:text-5xl">Tableau de bord</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-[#6B655D]">Pilotez vos mouvements, suivez les inscriptions et gardez une vue claire sur les activités qui nécessitent votre attention.</p>
        </div>
        <RouterLink to="/mouvement/inscriptions" class="inline-flex min-h-10 items-center justify-center gap-2 bg-[#C25A34] px-4 text-sm font-semibold text-white hover:bg-[#A84A28]">
          Voir les inscriptions <ArrowRight class="size-4" />
        </RouterLink>
      </div>
    </header>

    <div v-if="!totals" class="flex min-h-40 items-center justify-center"><AppSpinner /></div>

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enfants inscrits" :value="String(totals.children)" hint="Enfants rattachés à vos mouvements" />
        <StatCard label="Membres actifs" :value="String(totals.activeMembers)" hint="Membres actuellement actifs" />
        <StatCard label="À traiter" :value="String(totals.pendingRegistrations)" hint="Inscriptions en attente" />
        <StatCard label="Paiements réussis" :value="formatAmount(totals.paymentsAmount)" :hint="totals.successfulPayments + ' paiement(s) confirmé(s)'" />
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <article class="border border-[#C2BAB0] bg-white">
          <div class="flex items-center justify-between border-b border-[#DDD7CF] px-6 py-5">
            <div>
              <p class="eyebrow text-[#6B655D]">Vos mouvements</p>
              <h2 class="page-title mt-1 text-2xl text-[#14345E]">Périmètre de gestion</h2>
            </div>
            <RouterLink to="/mouvement/mon-mouvement" class="text-sm font-semibold text-[#24548F] hover:underline">Détails</RouterLink>
          </div>
          <div v-if="movements.length" class="divide-y divide-[#EDE9E4]">
            <RouterLink v-for="item in movements" :key="item.id" to="/mouvement/mon-mouvement" class="flex items-center justify-between gap-4 px-6 py-5 hover:bg-[#F7F5F2]">
              <div>
                <p class="font-semibold text-[#2E2925]">{{ item.name }}</p>
                <p class="mt-1 text-xs text-[#6B655D]">{{ item.code }} · {{ item.status === 'ACTIVE' ? 'Actif' : item.status }}</p>
              </div>
              <AppBadge :tone="item.status === 'ACTIVE' ? 'success' : 'neutral'">{{ item.status === 'ACTIVE' ? 'Actif' : item.status }}</AppBadge>
            </RouterLink>
          </div>
          <div v-else class="p-6 text-sm text-[#6B655D]">Aucun mouvement ne vous est actuellement attribué.</div>
        </article>

        <article class="border border-[#C2BAB0] bg-white">
          <div class="border-b border-[#DDD7CF] px-6 py-5">
            <p class="eyebrow text-[#6B655D]">Accès rapides</p>
            <h2 class="page-title mt-1 text-2xl text-[#14345E]">Actions courantes</h2>
          </div>
          <nav class="divide-y divide-[#EDE9E4]">
            <RouterLink v-for="item in [
              { to: '/mouvement/enfants', label: 'Consulter les enfants', icon: Users },
              { to: '/mouvement/inscriptions', label: 'Traiter les inscriptions', icon: CalendarCheck },
              { to: '/mouvement/cotisations', label: 'Gérer les cotisations', icon: CreditCard },
              { to: '/mouvement/documents', label: 'Gérer les documents', icon: FileText },
              { to: '/mouvement/communications', label: 'Envoyer une communication', icon: MessageSquare },
            ]" :key="item.to" :to="item.to" class="flex items-center gap-3 px-6 py-4 text-sm font-semibold text-[#2E2925] hover:bg-[#F7F5F2]">
              <component :is="item.icon" class="size-4 text-[#C25A34]" />
              <span>{{ item.label }}</span>
              <ArrowRight class="ml-auto size-4 text-[#6B655D]" />
            </RouterLink>
          </nav>
        </article>
      </div>
    </template>
  </section>
</template>