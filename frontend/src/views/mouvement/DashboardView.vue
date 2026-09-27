<script setup lang="ts">
import { onMounted, computed } from 'vue'
import StatCard from '@/components/molecules/StatCard.vue'
import AppSpinner from '@/components/atoms/AppSpinner.vue'
import { useMouvementStore } from '@/stores/mouvement'

const store = useMouvementStore()
const totals = computed(() => store.dashboard?.totals)

const formatAmount = (value = 0) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'

onMounted(() => store.loadDashboard())
</script>

<template>
  <section>
    <div class="border-b border-[#C2BAB0] pb-5">
      <p class="eyebrow text-[#C25A34]">Responsable de mouvement</p>
      <h1 class="page-title mt-1 text-4xl text-[#0B1F3A]">Tableau de bord</h1>
      <p class="mt-2 text-[#6B655D]">Une vue synthétique de votre mouvement.</p>
    </div>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-if="!totals" class="col-span-full flex justify-center py-10"><AppSpinner /></div>
      <template v-else>
        <StatCard label="Enfants inscrits" :value="String(totals.children)" hint="Inscriptions dans vos mouvements" />
        <StatCard label="Membres actifs" :value="String(totals.activeMembers)" hint="Membres actifs des mouvements" />
        <StatCard label="Inscriptions en attente" :value="String(totals.pendingRegistrations)" hint="Demandes à traiter" />
        <StatCard label="Paiements réussis" :value="formatAmount(totals.paymentsAmount)" :hint="totals.successfulPayments + ' paiement(s) confirmé(s)'" />
      </template>
    </div>
    <div class="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
      <article class="border border-[#C2BAB0] bg-white p-6">
        <p class="eyebrow text-[#6B655D]">Activité récente</p>
        <h2 class="page-title mt-2 text-2xl text-[#14345E]">Vue opérationnelle</h2>
        <p class="mt-3 text-sm leading-6 text-[#6B655D]">Les indicateurs sont maintenant alimentés par l’API du mouvement. Les événements et présences pourront être ajoutés dans les prochains modules.</p>
      </article>
      <article class="border border-[#C2BAB0] bg-white p-6">
        <p class="eyebrow text-[#6B655D]">Architecture</p>
        <h2 class="page-title mt-2 text-2xl text-[#14345E]">Module isolé</h2>
        <p class="mt-3 text-sm leading-6 text-[#6B655D]">Services, stores, types et vues restent dans le domaine mouvement pour limiter les conflits Git.</p>
      </article>
    </div>
  </section>
</template>
