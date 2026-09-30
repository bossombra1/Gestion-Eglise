<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const labels: Record<string, { title: string; description: string }> = {
  utilisateurs: { title: 'Utilisateurs', description: 'Comptes, rôles et accès de la paroisse.' },
  mouvements: { title: 'Mouvements', description: 'Catalogue des mouvements, responsables et paramètres opérationnels.' },
  activite: { title: 'Activité des mouvements', description: 'Vue consolidée des effectifs, inscriptions et cotisations par mouvement.' },
  inscriptions: { title: 'Suivi des inscriptions', description: 'Suivi global des demandes sans remplacer le traitement opérationnel du responsable concerné.' },
  documents: { title: 'Documents', description: 'Documents paroissiaux et suivi documentaire des dossiers.' },
  finances: { title: 'Finances', description: 'Vue consolidée des cotisations, paiements, dons et projets.' },
  communications: { title: 'Communications', description: 'Annonces et campagnes diffusées aux utilisateurs de la paroisse.' },
  agenda: { title: 'Agenda', description: 'Événements et horaires visibles dans l’application mobile.' },
  intentions: { title: 'Intentions de messe', description: 'Suivi administratif des demandes de messe et de leurs créneaux.' },
  rapports: { title: 'Rapports', description: 'Rapports détaillés transmis par les responsables de mouvement.' },
  parametres: { title: 'Paramètres', description: 'Configuration opérationnelle autorisée pour cette paroisse.' },
}

const current = computed(() => labels[String(route.params.module)] ?? { title: 'Module', description: 'Module Administration.' })
</script>

<template>
  <section class="space-y-6">
    <header class="border border-[#C2BAB0] bg-white p-5 sm:p-7">
      <p class="eyebrow text-[#C25A34]">Administration</p>
      <h1 class="page-title mt-2 text-3xl text-[#0B1F3A] sm:text-4xl">{{ current.title }}</h1>
      <p class="mt-3 max-w-3xl text-sm leading-6 text-[#6B655D]">{{ current.description }}</p>
    </header>

    <article class="border border-dashed border-[#C2BAB0] bg-white p-6 sm:p-8">
      <p class="text-sm font-semibold text-[#14345E]">Fondation de l’espace</p>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-[#6B655D]">
        L’interface est en place. Les données métier seront branchées sur les services d’administration correspondants sans créer de fausses données.
      </p>
    </article>
  </section>
</template>
