<script setup lang="ts">
import AppButton from '@/components/atoms/AppButton.vue'
import { ArrowRight } from 'lucide-vue-next'
defineProps<{ title: string; description: string }>()
</script>

<template>
  <section>
    <p class="eyebrow text-[#C25A34]">Responsable de mouvement</p>
    <h1 class="page-title mt-1 text-4xl text-[#0B1F3A]">{{ title }}</h1>
    <p class="mt-2 text-[#6B655D]">{{ description }}</p>
    <article class="mt-6 border border-dashed border-[#C2BAB0] bg-white p-8">
      <p class="font-serif text-2xl text-[#14345E]">Écran prêt pour le développement métier</p>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-[#6B655D]">La structure appartient uniquement au domaine Responsable de mouvement. Les données et règles métier seront branchées dans le service et le store du module.</p>
      <AppButton class="mt-5"><ArrowRight class="size-4" /> Continuer</AppButton>
    </article>
  </section>
</template>
