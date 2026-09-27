<script setup lang="ts">
defineProps<{ label: string; value: string | number; hint?: string }>()
</script>

<template>
  <article class="border border-[#C2BAB0] bg-white p-5">
    <p class="eyebrow text-[#6B655D]">{{ label }}</p>
    <p class="mt-2 font-serif text-4xl font-semibold text-[#14345E]">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-sm text-[#6B655D]">{{ hint }}</p>
  </article>
</template>
