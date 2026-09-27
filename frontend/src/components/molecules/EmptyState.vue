<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="border border-dashed border-[#C2BAB0] bg-white px-6 py-12 text-center">
    <h2 class="font-serif text-2xl font-semibold text-[#14345E]">{{ title }}</h2>
    <p v-if="description" class="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6B655D]">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5"><slot /></div>
  </div>
</template>
