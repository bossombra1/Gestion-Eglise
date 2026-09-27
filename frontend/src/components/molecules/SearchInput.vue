<script setup lang="ts">
import { Search } from 'lucide-vue-next'
defineProps<{ modelValue: string; placeholder?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="relative block">
    <span class="sr-only">Rechercher</span>
    <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B655D]" />
    <input
      :value="modelValue"
      :placeholder="placeholder ?? 'Rechercher…'"
      class="min-h-10 w-full border border-[#C2BAB0] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#24548F]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
