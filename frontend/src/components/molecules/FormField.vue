<script setup lang="ts">
defineProps<{ label: string; error?: string; required?: boolean }>()
</script>

<template>
  <label class="block">
    <span class="mb-1.5 block text-sm font-semibold text-[#2E2925]">
      {{ label }}<span v-if="required" class="text-[#B3261E]"> *</span>
    </span>
    <slot />
    <span v-if="error" class="mt-1 block text-xs font-medium text-[#B3261E]">{{ error }}</span>
  </label>
</template>
