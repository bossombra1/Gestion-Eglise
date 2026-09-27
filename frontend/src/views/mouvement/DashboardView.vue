<script setup lang="ts">
import StatCard from '@/components/molecules/StatCard.vue'
</script>

<template>
  <section>
    <div class="border-b border-[#C2BAB0] pb-5">
      <p class="eyebrow text-[#C25A34]">Responsable de mouvement</p>
      <h1 class="page-title mt-1 text-4xl text-[#0B1F3A]">Tableau de bord</h1>
      <p class="mt-2 text-[#6B655D]">Une vue synthétique de votre mouvement.</p>
    </div>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Enfants inscrits" value="—" hint="Donnée API à brancher" />
      <StatCard label="Parents" value="—" hint="Donnée API à brancher" />
      <StatCard label="Inscriptions en attente" value="—" hint="Donnée API à brancher" />
      <StatCard label="Cotisations" value="—" hint="Donnée API à brancher" />
    </div>
    <div class="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
      <article class="border border-[#C2BAB0] bg-white p-6">
        <p class="eyebrow text-[#6B655D]">Activité récente</p>
        <h2 class="page-title mt-2 text-2xl text-[#14345E]">À venir</h2>
        <p class="mt-3 text-sm leading-6 text-[#6B655D]">Les événements, inscriptions et présences seront alimentés par le module mouvement.</p>
      </article>
      <article class="border border-[#C2BAB0] bg-white p-6">
        <p class="eyebrow text-[#6B655D]">Architecture</p>
        <h2 class="page-title mt-2 text-2xl text-[#14345E]">Module isolé</h2>
        <p class="mt-3 text-sm leading-6 text-[#6B655D]">Services, stores, types et vues restent dans le domaine mouvement pour limiter les conflits Git.</p>
      </article>
    </div>
  </section>
</template>
